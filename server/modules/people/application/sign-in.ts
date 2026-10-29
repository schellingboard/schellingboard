import {
  conflict,
  forbidden,
  limited,
  notFound,
  ok,
  unavailable,
  type Result,
} from "@/server/kernel/result";
import type { Actor } from "@/server/kernel/actor";
import {
  TOO_MANY_ATTEMPTS_ERROR,
  TOO_MANY_EMAILS_ERROR,
  emailRetryAfter,
  loginRetryAfter,
  recordEmailIssued,
  recordLoginFailure,
} from "@/server/kernel/rate-limit";
import { realNow } from "@/utils/real-clock";
import {
  AUTH_CODE_VALID_MINUTES,
  generateAuthCode,
  generateAuthCodeSalt,
  hashAuthCode,
  verifyUserPassword,
} from "@/utils/user-credentials";
import type { PeopleDeps } from "../ports";
import { isSpent, matchToken, recentlyIssued } from "./auth-tokens";
import { signIn, type SignedIn } from "./identity";

export const requestLoginCode =
  ({ repos, loginMail }: PeopleDeps) =>
  async (guestId: string): Promise<Result<null>> => {
    if (!loginMail.configured())
      return unavailable(
        "auth.mailUnavailable",
        "This server cannot send email, so codes are unavailable"
      );
    const guest = await repos.guests.findById(guestId);
    if (!guest) return notFound("guest.notFound", "Unknown user");

    const now = realNow();
    const emailWait = emailRetryAfter(guestId, now.getTime());
    if (emailWait > 0)
      return limited("auth.tooManyEmails", TOO_MANY_EMAILS_ERROR, emailWait);
    const recent = await recentlyIssued(repos, guestId, "login", now);
    if (recent)
      return isSpent(recent)
        ? conflict(
            "auth.codeSpent",
            "Too many wrong codes were entered, so the one you were emailed is used up — ask for a new one in a minute"
          )
        : conflict(
            "auth.codeRecentlySent",
            "A code was emailed to you moments ago — check your inbox and spam folder"
          );

    const code = generateAuthCode();
    const salt = generateAuthCodeSalt();
    await repos.authCodes.replace({
      guestId,
      purpose: "login",
      salt,
      codeHash: hashAuthCode(code, salt),
      createdAt: now,
      expiresAt: new Date(now.getTime() + AUTH_CODE_VALID_MINUTES * 60 * 1000),
    });
    try {
      await loginMail.send({
        guestId,
        name: guest.name,
        email: guest.info.email,
        code,
        validMinutes: AUTH_CODE_VALID_MINUTES,
      });
    } catch (err) {
      console.error("Failed to send login code email:", err);
      return unavailable(
        "auth.mailFailed",
        "The email could not be sent — try again"
      );
    }
    recordEmailIssued(guestId, now.getTime());
    return ok(null);
  };

/**
 * Logs in with the permanent password or a currently valid emailed code (spent
 * on success, so it never replays). Only the password path is rate limited per
 * guest: a code still gets in during a lockout, so hammering someone's password
 * cannot lock the real person out of their inbox route.
 */
export const logIn = (deps: PeopleDeps) => {
  const start = signIn(deps);
  const { repos, loginMail } = deps;
  return async (
    actor: Actor,
    {
      guestId,
      credential,
      device,
    }: { guestId: string; credential: string; device?: string | null }
  ): Promise<Result<SignedIn>> => {
    const creds = await repos.guests.getAuthCredentials(guestId);
    if (!creds) return notFound("guest.notFound", "Unknown user");
    const passwordWait = loginRetryAfter("guest", guestId);
    const passwordBlocked = passwordWait > 0;
    if (
      !passwordBlocked &&
      (await verifyUserPassword(credential, creds.passwordHash))
    )
      return ok(await start(actor, { guestId, level: "verified", device }));
    const matched = await matchToken(repos, guestId, "login", credential);
    if (matched) {
      await repos.authCodes.consume(matched.id);
      return ok(await start(actor, { guestId, level: "verified", device }));
    }
    recordLoginFailure("guest", guestId);
    if (!passwordBlocked)
      return forbidden("auth.credentialWrong", "Wrong password or code");
    // Only the password is refused; saying a code still works is true only
    // where this server can send one.
    return limited(
      "auth.tooManyAttempts",
      loginMail.configured()
        ? "Too many failed attempts — the password won't work for a few minutes, but a code emailed to you still will"
        : TOO_MANY_ATTEMPTS_ERROR,
      passwordWait
    );
  };
};
