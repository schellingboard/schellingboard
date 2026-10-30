import {
  conflict,
  forbidden,
  invalid,
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
  hashUserPassword,
  verifyUserPassword,
} from "@/utils/user-credentials";
import type { PeopleDeps } from "../ports";
import {
  isSpent,
  matchToken,
  recentlyIssued,
  resolveTarget,
  type GuestTarget,
} from "./auth-tokens";
import { signIn, type SignedIn } from "./identity";

let dummy: Promise<string> | undefined;
const dummyHash = () => (dummy ??= hashUserPassword("no such guest"));

export const requestLoginCode =
  ({ repos, loginMail }: PeopleDeps) =>
  async (target: GuestTarget): Promise<Result<null>> => {
    if (!loginMail.configured())
      return unavailable(
        "auth.mailUnavailable",
        "This server cannot send email, so codes are unavailable"
      );
    const guestId = await resolveTarget(repos, target);
    // An identifier nobody holds answers like one that sent a code.
    if (guestId === null) return ok(null);
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
  // Only the password is refused; saying a code still works is true only
  // where this server can send one.
  const lockedOut = (wait: number) =>
    limited(
      "auth.tooManyAttempts",
      loginMail.configured()
        ? "Too many failed attempts — the password won't work for a few minutes, but a code emailed to you still will"
        : TOO_MANY_ATTEMPTS_ERROR,
      wait
    );
  return async (
    actor: Actor,
    {
      guestId: named,
      identifier,
      credential,
      device,
    }: {
      guestId?: string;
      identifier?: string;
      credential: string;
      device?: string | null;
    }
  ): Promise<Result<SignedIn>> => {
    let guestId = named;
    if (identifier !== undefined) {
      // Unknown identifiers share a bucket per spelling, so guessing them is
      // limited and the answer never says whether one exists.
      const key = `identifier:${identifier.toLowerCase()}`;
      const found = await repos.guests.findLoginId(identifier);
      if (!found) {
        const wait = loginRetryAfter("guest", key);
        // Same work and same answers as a known guest with a wrong password.
        if (wait <= 0) await verifyUserPassword(credential, await dummyHash());
        recordLoginFailure("guest", key);
        return wait > 0
          ? lockedOut(wait)
          : forbidden("auth.credentialWrong", "Wrong password or code");
      }
      guestId = found;
    }
    if (guestId === undefined)
      return invalid("login.target", "Name the guest or give an identifier");
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
    return lockedOut(passwordWait);
  };
};
