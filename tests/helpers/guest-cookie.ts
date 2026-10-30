import Database from "better-sqlite3";
import type { LoginAssurance } from "@schellingboard/domain/auth";
import { resolveDbPath } from "@/db/migrate";
import { GUEST_COOKIE_NAME } from "@/utils/auth";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_LIFETIME_MS,
} from "@/utils/login-session-token";
import { realNow } from "@/utils/real-clock";

// Its own connection, so openGuestValue can stay synchronous for call sites.
function storeSession(
  guestId: string,
  assurance: LoginAssurance,
  expiresAt?: Date
): string {
  const token = generateSessionToken();
  const now = realNow();
  const db = new Database(resolveDbPath());
  try {
    db.prepare(
      `INSERT INTO login_sessions
         (id, guest_id, assurance, created_at, expires_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      hashSessionToken(token),
      guestId,
      assurance,
      now.toISOString(),
      (
        expiresAt ?? new Date(now.getTime() + SESSION_LIFETIME_MS)
      ).toISOString(),
      now.toISOString()
    );
  } finally {
    db.close();
  }
  return token;
}

/** Stores a claimed row for an existing guest and returns its cookie value. */
export function openGuestValue(guestId: string): string {
  return storeSession(guestId, "claimed");
}

/** Stores a verified row and returns its cookie value. */
export function verifiedGuestValue(guestId: string): Promise<string> {
  return sessionGuestValue(guestId, "verified");
}

/** Stores a login session row and returns the cookie value that names it. */
export function sessionGuestValue(
  guestId: string,
  assurance: LoginAssurance,
  opts: { expiresAt?: Date } = {}
): Promise<string> {
  return Promise.resolve(storeSession(guestId, assurance, opts.expiresAt));
}

export { GUEST_COOKIE_NAME };
