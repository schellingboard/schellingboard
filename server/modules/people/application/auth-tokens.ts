import type { AuthCode, AuthCodePurpose } from "@schellingboard/domain/auth";
import {
  MAX_CODE_ATTEMPTS,
  authCodeMatches,
  isAuthCodeShaped,
  normalizeAuthCode,
} from "@/utils/user-credentials";
import { realNow } from "@/utils/real-clock";
import type { PeopleDeps } from "../ports";

export const REQUEST_THROTTLE_SECONDS = 60;

type TokenRepos = Pick<PeopleDeps["repos"], "authCodes">;

/**
 * The guest's active token of `purpose` if `input` matches it, else null. A
 * wrong guess at a login code counts against its cap; matching consumes nothing.
 * Login codes forgive case and whitespace; reset tokens match verbatim.
 */
export async function matchToken(
  { authCodes }: TokenRepos,
  guestId: string,
  purpose: AuthCodePurpose,
  input: string
): Promise<AuthCode | null> {
  const active = await authCodes.findActive(guestId, purpose, realNow());
  if (!active || active.attempts >= MAX_CODE_ATTEMPTS) return null;
  const candidate =
    purpose === "login" ? normalizeAuthCode(input) : input.trim();
  if (authCodeMatches(candidate, active.salt, active.codeHash)) return active;
  // A reset token carries 256 bits, so guessing it is infeasible, and retiring
  // it after some tries would let anyone who knows a guest id knock out the
  // link that guest was just emailed.
  if (purpose !== "login") return null;
  // A login code shares one input field with the permanent password, so only
  // input that could have been a code counts as a guess at it; otherwise a
  // guest fumbling their password would burn the code they were emailed.
  if (!isAuthCodeShaped(candidate)) return null;
  await authCodes.recordFailedAttempt(active.id);
  if (active.attempts + 1 === MAX_CODE_ATTEMPTS) {
    console.warn(
      `Login code of guest ${guestId} hit the guess cap — retiring it`
    );
  }
  return null;
}

/**
 * The token of `purpose` emailed within the throttle window, if still valid. A
 * login code with no guesses left counts too, or anyone could mint a new
 * code and email by exhausting it.
 */
export async function recentlyIssued(
  { authCodes }: TokenRepos,
  guestId: string,
  purpose: AuthCodePurpose,
  now: Date
): Promise<AuthCode | null> {
  const existing = await authCodes.findActive(guestId, purpose, now);
  if (
    !existing ||
    now.getTime() - existing.createdAt.getTime() >=
      REQUEST_THROTTLE_SECONDS * 1000
  ) {
    return null;
  }
  return existing;
}

export const isSpent = (token: AuthCode) => token.attempts >= MAX_CODE_ATTEMPTS;
