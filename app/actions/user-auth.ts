"use server";

import { cookies } from "next/headers";
import { createGuestCookie, createGuestLogoutCookie } from "@/utils/auth";
import { verifiedCurrentUser } from "@/utils/acting-guest";
import { requireSiteAuth } from "@/utils/action-auth";
import { peopleUseCases } from "@/server/composition";
import { actorOf } from "@/server/kernel/session-actor";
import { ok, type Result } from "@/server/kernel/result";
import type { Identity } from "@/server/modules/people/module";

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

const THROTTLED_CODES = new Set([
  "auth.codeRecentlySent",
  "auth.linkRecentlySent",
]);

function toResult(result: Result<unknown>): UserAuthResult {
  if (result.ok) return { ok: true };
  return {
    ok: false,
    error: result.error.detail ?? result.error.code,
    ...(THROTTLED_CODES.has(result.error.code) && { throttled: true }),
  };
}

/** Emails the guest a single-use login code (link + typeable code). */
export async function requestLoginCodeAction(
  guestId: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  return toResult(await peopleUseCases().requestLoginCode(guestId));
}

/** Emails the guest a single-use link to set a password (see `requestResetLink`). */
export async function requestPasswordLinkAction(
  guestId: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  return toResult(await peopleUseCases().requestResetLink(guestId));
}

/** Logs in as a guest with the password or an emailed code (see `logIn`). */
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
  if (!result.ok) return toResult(result);
  cookieStore.set(createGuestCookie(result.value.sessionToken));
  return { ok: true };
}

/**
 * Sets a new password from a valid reset link (see `resetPassword`). A browser
 * that had this guest selected is logged out (#805): its session row is gone
 * and the cookie would only leave a name selected that every page refuses.
 */
export async function setPasswordWithTokenAction(
  guestId: string,
  token: string,
  newPassword: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  const cookieStore = await cookies();
  const actor = await actorOf(cookieStore);
  const people = peopleUseCases();
  const result = await people.resetPassword({ guestId, token, newPassword });
  if (result.ok && actor.guest?.id === guestId) {
    await people.signOut(actor);
    cookieStore.set(createGuestLogoutCookie());
  }
  return toResult(result);
}

/** Changes the current user's password (see `changePassword`). */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  return toResult(
    await peopleUseCases().changePassword(await actorOf(await cookies()), {
      currentPassword,
      newPassword,
    })
  );
}

/** Turns protection off for the current user (see `unprotect`). */
export async function disableProtectionAction(
  currentPassword: string
): Promise<UserAuthResult> {
  await requireSiteAuth();
  const cookieStore = await cookies();
  const result = await peopleUseCases().unprotect(await actorOf(cookieStore), {
    currentPassword,
  });
  if (!result.ok) return toResult(result);
  cookieStore.set(createGuestCookie(result.value.sessionToken));
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
