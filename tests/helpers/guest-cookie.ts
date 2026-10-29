import type { LoginAssurance } from "@schellingboard/domain/auth";
import { getRepositories } from "@/db/container";
import { GUEST_COOKIE_NAME } from "@/utils/auth";
import { signCookieValue, verifiedScope } from "@/utils/auth-cookies";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_LIFETIME_MS,
} from "@/utils/login-session-token";
import { realNow } from "@/utils/real-clock";

// Test helpers for building the single `guest` cookie value that the app sets
// for the current guest. See utils/auth.ts for the format.

/** Raw value for an unverified "open" name selection (unsigned, no secret). */
export function openGuestValue(guestId: string): string {
  return `open.${guestId}`;
}

/** Raw value for a legacy verified (signed) cookie. Requires AUTH_SECRET to be set. */
export async function verifiedGuestValue(guestId: string): Promise<string> {
  return signCookieValue(verifiedScope(guestId));
}

/** Stores a login session row and returns the cookie value that names it. */
export async function sessionGuestValue(
  guestId: string,
  assurance: LoginAssurance,
  opts: { expiresAt?: Date } = {}
): Promise<string> {
  const token = generateSessionToken();
  const now = realNow();
  await getRepositories().loginSessions.create({
    id: hashSessionToken(token),
    guestId,
    eventId: null,
    assurance,
    createdAt: now,
    expiresAt: opts.expiresAt ?? new Date(now.getTime() + SESSION_LIFETIME_MS),
    lastSeenAt: now,
    device: null,
  });
  return token;
}

export { GUEST_COOKIE_NAME };
