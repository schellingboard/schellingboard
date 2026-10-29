"use server";

import { cookies } from "next/headers";
import { newPasswordSchema } from "@schellingboard/contracts/auth";
import { getRepositories } from "@/db/container";
import { credentialsChanged } from "@/server/kernel/credential-changes";
import {
  createGuestCookie,
  createGuestLogoutCookie,
  GUEST_COOKIE_NAME,
} from "@/utils/auth";
import {
  RESET_TOKEN_VALID_MINUTES,
  generateAuthCodeSalt,
  generateResetToken,
  hashAuthCode,
  hashUserPassword,
  verifyUserPassword,
} from "@/utils/user-credentials";
import { verifiedCurrentUser } from "@/utils/acting-guest";
import { requireSiteAuth } from "@/utils/action-auth";
import { peopleUseCases } from "@/server/composition";
import { actorOf, guestOfCookie } from "@/server/kernel/session-actor";
import { ok, type Result } from "@/server/kernel/result";
import {
  matchToken,
  recentlyIssued,
  type Identity,
} from "@/server/modules/people/module";
import {
  TOO_MANY_ATTEMPTS_ERROR,
  TOO_MANY_EMAILS_ERROR,
  isEmailIssuanceBlocked,
  loginRetryAfter,
  recordEmailIssued,
  recordLoginFailure,
} from "@/server/kernel/rate-limit";
import { isMailerConfigured, sendMail } from "@/utils/mailer";
import { siteUrl } from "@/utils/site-url";
import { authPasswordResetEmail } from "@/emails/auth-password-reset";
import { authSecurityChangedEmail } from "@/emails/auth-security-changed";

export type UserAuthResult =
  | { ok: true }
  // throttled: a recently emailed token is still valid — the UI may present
  // this as information rather than an error.
  | { ok: false; error: string; throttled?: boolean };
export type SelectUserResult =
  | { ok: true }
  // needsAuth: the guest is protected and the caller must present a
  // password or emailed code (loginAsGuestAction) instead.
  | { ok: false; needsAuth?: boolean; error: string };

/** Emails the guest a single-use login code (link + typeable code). */
export async function requestLoginCodeAction(
  guestId: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  const result = await peopleUseCases().requestLoginCode(guestId);
  if (result.ok) return { ok: true };
  return {
    ok: false,
    error: result.error.detail ?? result.error.code,
    ...(result.error.code === "auth.codeRecentlySent" && { throttled: true }),
  };
}

/**
 * Emails the guest a single-use link to set a new password. Used both to enable
 * protection (set the first password) and to recover a forgotten one — either
 * way, clicking it proves control of the address on file, which is what stops
 * anyone else from claiming a name. The link grants no session on its own.
 */
export async function requestPasswordLinkAction(
  guestId: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  if (!isMailerConfigured()) {
    return {
      ok: false,
      error: "This server cannot send email, so password links are unavailable",
    };
  }
  const { guests, authCodes } = getRepositories();
  const guest = await guests.findById(guestId);
  if (!guest) {
    return { ok: false, error: "Unknown user" };
  }

  // eslint-disable-next-line no-restricted-syntax -- the throttle and the token's lifetime are real time by design (ADR 0004)
  const now = new Date();
  if (isEmailIssuanceBlocked(guestId, now.getTime())) {
    return { ok: false, error: TOO_MANY_EMAILS_ERROR };
  }
  if (await recentlyIssued(getRepositories(), guestId, "reset", now)) {
    return {
      ok: false,
      throttled: true,
      error:
        "A link was emailed to you moments ago — check your inbox and spam folder",
    };
  }

  const token = generateResetToken();
  const salt = generateAuthCodeSalt();
  await authCodes.replace({
    guestId,
    purpose: "reset",
    salt,
    codeHash: hashAuthCode(token, salt),
    createdAt: now,
    expiresAt: new Date(now.getTime() + RESET_TOKEN_VALID_MINUTES * 60 * 1000),
  });

  const resetUrl = `${siteUrl()}/auth/reset?guest=${encodeURIComponent(
    guestId
  )}&token=${encodeURIComponent(token)}`;
  try {
    await sendMail({
      to: guest.info.email,
      ...authPasswordResetEmail({
        name: guest.name,
        resetUrl,
        validMinutes: RESET_TOKEN_VALID_MINUTES,
      }),
    });
  } catch (err) {
    console.error("Failed to send password link email:", err);
    return { ok: false, error: "The email could not be sent — try again" };
  }
  recordEmailIssued(guestId, now.getTime());
  return { ok: true };
}

/**
 * Authenticates as a (protected) guest with the permanent password or a
 * currently valid emailed login code, and makes them the current user. The
 * rules live in `logIn` in the people module.
 */
export async function loginAsGuestAction(
  guestId: string,
  credential: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  const cookieStore = await cookies();
  const result = await peopleUseCases().logIn(await actorOf(cookieStore), {
    guestId,
    credential,
  });
  if (!result.ok)
    return { ok: false, error: result.error.detail ?? result.error.code };
  cookieStore.set(createGuestCookie(result.value.sessionToken));
  return { ok: true };
}

async function setProtection(
  guestId: string,
  creds: Parameters<
    ReturnType<typeof getRepositories>["guests"]["setAuthProtection"]
  >[1]
): Promise<void> {
  await getRepositories().guests.setAuthProtection(guestId, creds);
  credentialsChanged(guestId);
}

/**
 * Sets a new password from a valid reset link and turns protection on. Proves
 * nothing but control of the emailed link, so it deliberately does NOT create a
 * session: the guest logs in with the new password afterwards. Consumes the
 * token so the link works once. If the guest was already protected this is a
 * password reset, which sends a best-effort heads-up to the address on file.
 *
 * A browser that had this guest selected is logged out (#805): its cookie —
 * an open selection, or a session proof that predates the new password —
 * stops being honoured the moment protection is on, and leaving it in place
 * leaves a name selected that every page then refuses to act as.
 */
export async function setPasswordWithTokenAction(
  guestId: string,
  token: string,
  newPassword: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  const parsed = newPasswordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const { guests, authCodes, loginSessions } = getRepositories();
  const matched = await matchToken(getRepositories(), guestId, "reset", token);
  if (!matched) {
    return { ok: false, error: "This link is invalid or has expired" };
  }
  const creds = await guests.getAuthCredentials(guestId);
  const wasProtected = creds?.authProtected ?? false;
  await setProtection(guestId, {
    authProtected: true,
    passwordHash: await hashUserPassword(parsed.data),
  });
  await authCodes.consume(matched.id);
  // First protection keeps other browsers' claimed rows: they are refused as
  // "protected", which tells their user what happened.
  if (wasProtected) await loginSessions.deleteForGuest(guestId);
  else await loginSessions.deleteVerifiedForGuest(guestId);
  const cookieStore = await cookies();
  const selected = await guestOfCookie(
    cookieStore.get(GUEST_COOKIE_NAME)?.value
  );
  if (selected?.id === guestId) {
    cookieStore.set(createGuestLogoutCookie());
  }
  if (wasProtected) {
    await notifySecurityChange(guestId, "password-changed");
  }
  return { ok: true };
}

/**
 * Changes the current (protected) user's password. Gated on knowing the current
 * password — a bare session never suffices — so no email is sent to start; a
 * best-effort "your password was changed" heads-up follows. The session stays
 * authenticated.
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  const parsed = newPasswordSchema.safeParse(newPassword);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const guestId = await verifiedCurrentUser(await cookies());
  if (!guestId) {
    return { ok: false, error: "No user is selected" };
  }
  const { guests } = getRepositories();
  const creds = await guests.getAuthCredentials(guestId);
  if (!creds || !creds.authProtected) {
    return { ok: false, error: "Your name isn't protected" };
  }
  // Shares the login limiter: a stolen session must not be able to guess the
  // current password (and so take the account over) at unlimited speed.
  if (loginRetryAfter("guest", guestId) > 0) {
    return { ok: false, error: TOO_MANY_ATTEMPTS_ERROR };
  }
  if (!(await verifyUserPassword(currentPassword, creds.passwordHash))) {
    recordLoginFailure("guest", guestId);
    return { ok: false, error: "Wrong password" };
  }
  await setProtection(guestId, {
    authProtected: true,
    passwordHash: await hashUserPassword(parsed.data),
  });
  await getRepositories().loginSessions.deleteForGuest(
    guestId,
    (await actorOf(await cookies())).guest?.sessionId
  );
  await notifySecurityChange(guestId, "password-changed");
  return { ok: true };
}

/**
 * Turns protection off for the current user. Gated on the current password (if
 * forgotten, reset it first). Drops the now-moot authenticated session and
 * sends a best-effort heads-up.
 */
export async function disableProtectionAction(
  currentPassword: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  const cookieStore = await cookies();
  const guestId = await verifiedCurrentUser(cookieStore);
  if (!guestId) {
    return { ok: false, error: "No user is selected" };
  }
  const { guests } = getRepositories();
  const creds = await guests.getAuthCredentials(guestId);
  if (!creds || !creds.authProtected) {
    return { ok: false, error: "Your name isn't protected" };
  }
  // Same reasoning as changePasswordAction: gate the guess rate.
  if (loginRetryAfter("guest", guestId) > 0) {
    return { ok: false, error: TOO_MANY_ATTEMPTS_ERROR };
  }
  if (!(await verifyUserPassword(currentPassword, creds.passwordHash))) {
    recordLoginFailure("guest", guestId);
    return { ok: false, error: "Wrong password" };
  }
  await setProtection(guestId, {
    authProtected: false,
    passwordHash: null,
  });
  // Drop the now-moot verified proof but keep the guest selected: the name is
  // unprotected now, so an "open" cookie is all it needs (and re-enabling
  // protection later will correctly require a fresh login).
  const identity = await peopleUseCases().signIn(await actorOf(cookieStore), {
    guestId,
    level: "claimed",
  });
  cookieStore.set(createGuestCookie(identity.sessionToken));
  await notifySecurityChange(guestId, "disabled");
  return { ok: true };
}

/**
 * The guest the server currently acts as, or null if no name is selected or
 * the selected one is protected without a verified session. Read-only: it
 * exists so long-lived client state can re-check an identity the server may
 * have stopped honouring since the page was rendered (see UserProvider).
 */
export async function currentVerifiedUserAction(): Promise<string | null> {
  await requireSiteAuth();
  return verifiedCurrentUser(await cookies());
}

/**
 * Switches the current user without credentials. Allowed for unprotected
 * guests, for a protected guest whose signed session cookie is still valid,
 * and for clearing the selection (null). Switching away from a protected
 * guest drops the authenticated session, so switching back requires
 * credentials again.
 */
export async function selectUserAction(
  guestId: string | null
): Promise<SelectUserResult> {
  await requireSiteAuth();
  const cookieStore = await cookies();
  const people = peopleUseCases();
  const result: Result<Identity> =
    guestId === null
      ? ok(await people.signOut(await actorOf(cookieStore)))
      : await people.chooseGuest(await actorOf(cookieStore), { guestId });
  if (!result.ok) {
    return result.error.code === "guest.protected"
      ? { ok: false, needsAuth: true, error: result.error.detail ?? "" }
      : { ok: false, error: result.error.detail ?? "Unknown user" };
  }
  const identity = result.value;
  cookieStore.set(
    identity.guestId === null
      ? createGuestLogoutCookie()
      : createGuestCookie(identity.sessionToken)
  );
  return { ok: true };
}

/** Best-effort heads-up that protection was disabled or the password
 * changed. Never blocks the change it follows: a failed notification here
 * is exactly the SMTP dependency this step exists to remove. */
async function notifySecurityChange(
  guestId: string,
  change: "disabled" | "password-changed"
): Promise<void> {
  try {
    const guest = await getRepositories().guests.findById(guestId);
    if (!guest) return;
    await sendMail({
      to: guest.info.email,
      ...authSecurityChangedEmail({ name: guest.name, change }),
    });
  } catch (err) {
    console.error(
      "Failed to send security-change notification to %s:",
      guestId,
      err
    );
  }
}
