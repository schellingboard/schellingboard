import {
  newPasswordSchema,
  usernameSchema,
} from "@schellingboard/contracts/auth";
import type { LoginSession } from "@schellingboard/domain/auth";

import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { credentialsChanged } from "@/server/kernel/credential-changes";
import {
  emailRetryAfter,
  loginRetryAfter,
  recordEmailIssued,
  recordLoginFailure,
  TOO_MANY_ATTEMPTS_ERROR,
  TOO_MANY_EMAILS_ERROR,
} from "@/server/kernel/rate-limit";
import {
  conflict,
  forbidden,
  invalidFields,
  limited,
  notFound,
  ok,
  type Result,
  unavailable,
} from "@/server/kernel/result";
import { realNow } from "@/utils/real-clock";
import {
  hashUserPassword,
  RESET_TOKEN_VALID_MINUTES,
  verifyUserPassword,
} from "@/utils/user-credentials";

import type { PeopleDeps } from "../ports";
import { noEmail } from "./admin-guests";
import {
  type GuestTarget,
  issuePasswordToken,
  matchToken,
  recentlyIssued,
  resolveTarget,
  retireTokens,
} from "./auth-tokens";
import { type SignedIn, signIn } from "./identity";

const NO_USER = "No user is selected";

async function actingOrRefuse(
  actor: Actor,
  { repos }: PeopleDeps
): Promise<Result<string>> {
  const acting = await actingGuest(actor, repos.guests);
  return acting.ok ? acting : forbidden(acting.error.code, NO_USER);
}

const weakPassword = (password: string) => {
  const parsed = newPasswordSchema.safeParse(password);
  return parsed.success
    ? null
    : invalidFields("password.invalid", [
        {
          path: "newPassword",
          message: parsed.error.issues[0]?.message ?? "Invalid",
        },
      ]);
};

/** Best effort: a failed heads-up never blocks the change it follows. */
async function notifySecurityChange(
  { repos, loginMail }: PeopleDeps,
  guestId: string,
  change: "disabled" | "password-changed"
) {
  try {
    const guest = await repos.guests.findById(guestId);
    if (guest?.info.email)
      await loginMail.sendSecurityChanged({
        name: guest.name,
        email: guest.info.email,
        locale: guest.info.locale,
        change,
      });
  } catch (err) {
    console.error(
      "Failed to send security-change notification to %s:",
      guestId,
      err
    );
  }
}

/**
 * Emails a single-use link to set a password. It both enables protection and
 * recovers a forgotten password; the link grants no session on its own.
 */
export const requestResetLink =
  ({ repos, loginMail }: PeopleDeps) =>
  async (target: GuestTarget): Promise<Result<null>> => {
    if (!loginMail.configured())
      return unavailable(
        "auth.mailUnavailable",
        "This server cannot send email, so password links are unavailable"
      );
    const guestId = await resolveTarget(repos, target);
    // An identifier nobody holds answers like one that sent a link.
    if (guestId === null) return ok(null);
    const guest = await repos.guests.findById(guestId);
    if (!guest) return notFound("guest.notFound", "Unknown user");
    if (!guest.info.email) return noEmail();

    const now = realNow();
    const emailWait = emailRetryAfter(guestId, now.getTime());
    if (emailWait > 0)
      return limited("auth.tooManyEmails", TOO_MANY_EMAILS_ERROR, emailWait);
    if (await recentlyIssued(repos, guestId, "reset", now))
      return conflict(
        "auth.linkRecentlySent",
        "A link was emailed to you moments ago — check your inbox and spam folder"
      );

    const token = await issuePasswordToken(
      repos,
      guestId,
      RESET_TOKEN_VALID_MINUTES,
      now
    );
    try {
      await loginMail.sendResetLink({
        guestId,
        name: guest.name,
        email: guest.info.email,
        locale: guest.info.locale,
        token,
        validMinutes: RESET_TOKEN_VALID_MINUTES,
      });
    } catch (err) {
      console.error("Failed to send password link email:", err);
      return unavailable(
        "auth.mailFailed",
        "The email could not be sent — try again"
      );
    }
    recordEmailIssued(guestId, now.getTime());
    return ok(null);
  };

/**
 * Sets the password a password link allows and turns protection on. It proves only
 * control of the emailed link, so it signs no one in. Other browsers' rows go:
 * all of them for a password reset, the verified ones for a first password
 * (claimed rows are then refused as "protected", which tells their user why).
 */
export const resetPassword = (deps: PeopleDeps) => {
  const { repos, uow } = deps;
  return async ({
    guestId,
    token,
    newPassword,
  }: {
    guestId: string;
    token: string;
    newPassword: string;
  }): Promise<Result<null>> => {
    const weak = weakPassword(newPassword);
    if (weak) return weak;
    const matched = await matchToken(repos, guestId, "reset", token);
    if (!matched)
      return forbidden(
        "auth.credentialWrong",
        "This link no longer works. Request a new one, or ask an admin."
      );
    // A site admin without a password is protected by the role, not by one.
    const wasProtected =
      (await repos.guests.getAuthCredentials(guestId))?.passwordHash != null;
    const passwordHash = await hashUserPassword(newPassword);
    await uow.run(async (tx) => {
      await tx.guests.setAuthProtection(guestId, {
        authProtected: true,
        passwordHash,
      });
      await tx.authCodes.consume(matched.id);
      if (wasProtected) await tx.loginSessions.deleteForGuest(guestId);
      else await tx.loginSessions.deleteVerifiedForGuest(guestId);
    });
    credentialsChanged(guestId);
    if (wasProtected)
      await notifySecurityChange(deps, guestId, "password-changed");
    return ok(null);
  };
};

/** The shared gate of changing or removing a password: knowing the current one. */
async function confirmedPassword(
  actor: Actor,
  deps: PeopleDeps,
  currentPassword: string
): Promise<Result<string>> {
  const acting = await actingOrRefuse(actor, deps);
  if (!acting.ok) return acting;
  const guestId = acting.value;
  const creds = await deps.repos.guests.getAuthCredentials(guestId);
  if (!creds?.passwordHash)
    return conflict("auth.notProtected", "Your name isn't protected");
  // A stolen session must not guess the current password at unlimited speed.
  const wait = loginRetryAfter("guest", guestId);
  if (wait > 0)
    return limited("auth.tooManyAttempts", TOO_MANY_ATTEMPTS_ERROR, wait);
  if (!(await verifyUserPassword(currentPassword, creds.passwordHash))) {
    recordLoginFailure("guest", guestId);
    return forbidden("auth.credentialWrong", "Wrong password");
  }
  return ok(guestId);
}

/** Sets the first password of a name; only a password link replaces one without the old. */
export const setFirstPassword = (deps: PeopleDeps) => {
  return async (
    actor: Actor,
    { newPassword }: { newPassword: string }
  ): Promise<Result<null>> => {
    const weak = weakPassword(newPassword);
    if (weak) return weak;
    const acting = await actingOrRefuse(actor, deps);
    if (!acting.ok) return acting;
    const guestId = acting.value;
    if (actor.guest?.level !== "verified")
      return forbidden(
        "auth.verificationRequired",
        "Sign in with a link or a code before setting a password"
      );
    const passwordHash = await hashUserPassword(newPassword);
    const stored = await deps.uow.run(async (tx) => {
      // Else whoever holds a forwarded link could set it and become admin.
      if (await tx.guests.getSiteAdmin(guestId))
        return forbidden(
          "siteAdmin.passwordLink",
          "A site admin's password changes only through a password link or with the old password"
        );
      if ((await tx.guests.getAuthCredentials(guestId))?.passwordHash)
        return conflict(
          "auth.passwordSet",
          "This name already has a password. Change it with the old one, or set a new one with a password link."
        );
      await tx.guests.setAuthProtection(guestId, {
        authProtected: true,
        passwordHash,
      });
      await tx.loginSessions.deleteForGuest(guestId, actor.guest?.sessionId);
      return ok(null);
    });
    if (!stored.ok) return stored;
    await retireTokens(deps.repos, guestId);
    credentialsChanged(guestId);
    await notifySecurityChange(deps, guestId, "password-changed");
    return stored;
  };
};

/** Changes the password; this session stays, the others are signed out. */
export const changePassword = (deps: PeopleDeps) => {
  return async (
    actor: Actor,
    {
      currentPassword,
      newPassword,
    }: { currentPassword: string; newPassword: string }
  ): Promise<Result<null>> => {
    const weak = weakPassword(newPassword);
    if (weak) return weak;
    const confirmed = await confirmedPassword(actor, deps, currentPassword);
    if (!confirmed.ok) return confirmed;
    const guestId = confirmed.value;
    const passwordHash = await hashUserPassword(newPassword);
    await deps.uow.run(async (tx) => {
      await tx.guests.setAuthProtection(guestId, {
        authProtected: true,
        passwordHash,
      });
      await tx.loginSessions.deleteForGuest(guestId, actor.guest?.sessionId);
    });
    await retireTokens(deps.repos, guestId);
    credentialsChanged(guestId);
    await notifySecurityChange(deps, guestId, "password-changed");
    return ok(null);
  };
};

/**
 * Turns protection off. The verified session is replaced by a claimed one, so
 * the browser keeps the name, and protecting it again will ask for a login.
 * A verified event still protects its members, so theirs stays verified.
 */
export const unprotect = (deps: PeopleDeps) => {
  const start = signIn(deps);
  return async (
    actor: Actor,
    {
      currentPassword,
      device,
    }: { currentPassword: string; device?: string | null }
  ): Promise<Result<SignedIn>> => {
    const acting = await actingOrRefuse(actor, deps);
    if (!acting.ok) return acting;
    if (await deps.repos.guests.getSiteAdmin(acting.value))
      return forbidden(
        "siteAdmin.protected",
        "A site admin's name stays protected"
      );
    const confirmed = await confirmedPassword(actor, deps, currentPassword);
    if (!confirmed.ok) return confirmed;
    const guestId = confirmed.value;
    await deps.repos.guests.setAuthProtection(guestId, {
      authProtected: false,
      passwordHash: null,
    });
    await retireTokens(deps.repos, guestId);
    credentialsChanged(guestId);
    const stillProtected = (await deps.repos.guests.getAuthCredentials(guestId))
      ?.authProtected;
    const identity = await start(actor, {
      guestId,
      level: stillProtected ? "verified" : "claimed",
      via: stillProtected ? "password" : "name",
      device,
    });
    await notifySecurityChange(deps, guestId, "disabled");
    return ok(identity);
  };
};

export const setUsername =
  (deps: PeopleDeps) =>
  async (
    actor: Actor,
    { username }: { username: string | null }
  ): Promise<Result<{ username: string | null }>> => {
    const acting = await actingOrRefuse(actor, deps);
    if (!acting.ok) return acting;
    let value: string | null = null;
    if (username !== null) {
      const parsed = usernameSchema.safeParse(username);
      if (!parsed.success)
        return invalidFields("username.invalid", [
          {
            path: "username",
            message: parsed.error.issues[0]?.message ?? "Invalid",
          },
        ]);
      value = parsed.data;
    }
    const stored = await deps.repos.guests.setUsername(acting.value, value);
    return stored === "ok"
      ? ok({ username: value })
      : conflict("username.taken", "That username is taken");
  };

export const getCredentials =
  (deps: PeopleDeps) =>
  async (
    actor: Actor
  ): Promise<
    Result<{
      authProtected: boolean;
      username: string | null;
      hasEmail: boolean;
      canSetPassword: boolean;
    }>
  > => {
    const acting = await actingOrRefuse(actor, deps);
    if (!acting.ok) return acting;
    const creds = await deps.repos.guests.getAuthCredentials(acting.value);
    const guest = await deps.repos.guests.findById(acting.value);
    return ok({
      authProtected: creds?.passwordHash != null,
      username: await deps.repos.guests.getUsername(acting.value),
      hasEmail: Boolean(guest?.info.email),
      canSetPassword:
        actor.guest?.level === "verified" &&
        !creds?.passwordHash &&
        !(await deps.repos.guests.getSiteAdmin(acting.value)),
    });
  };

export type OwnLoginSession = LoginSession & { current: boolean };

export const listLoginSessions =
  (deps: PeopleDeps) =>
  async (actor: Actor): Promise<Result<OwnLoginSession[]>> => {
    const acting = await actingOrRefuse(actor, deps);
    if (!acting.ok) return acting;
    const now = realNow();
    const rows = await deps.repos.loginSessions.listForGuest(acting.value);
    return ok(
      rows
        .filter((row) => row.expiresAt > now)
        .map((row) => ({ ...row, current: row.id === actor.guest?.sessionId }))
    );
  };

export const revokeLoginSession =
  (deps: PeopleDeps) =>
  async (
    actor: Actor,
    { id }: { id: string }
  ): Promise<Result<{ current: boolean }>> => {
    const acting = await actingOrRefuse(actor, deps);
    if (!acting.ok) return acting;
    const row = await deps.repos.loginSessions.get(id);
    if (row?.guestId !== acting.value)
      return notFound("loginSession.notFound", "Session not found");
    await deps.repos.loginSessions.delete(id);
    return ok({ current: id === actor.guest?.sessionId });
  };
