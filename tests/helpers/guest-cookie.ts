import Database from "better-sqlite3";
import type { LoginAssurance, LoginVia } from "@schellingboard/domain/auth";
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
  expiresAt?: Date,
  via?: LoginVia
): string {
  const token = generateSessionToken();
  const now = realNow();
  const db = new Database(resolveDbPath());
  try {
    db.prepare(
      `INSERT INTO login_sessions
         (id, guest_id, assurance, created_at, expires_at, last_seen_at, via)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      hashSessionToken(token),
      guestId,
      assurance,
      now.toISOString(),
      (
        expiresAt ?? new Date(now.getTime() + SESSION_LIFETIME_MS)
      ).toISOString(),
      now.toISOString(),
      via ?? (assurance === "verified" ? "password" : "name")
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

/** Stores a verified row (by password unless `via` says otherwise) and returns its cookie value. */
export function verifiedGuestValue(
  guestId: string,
  via?: LoginVia
): Promise<string> {
  return sessionGuestValue(guestId, "verified", { via });
}

/** Stores a login session row and returns the cookie value that names it. */
export function sessionGuestValue(
  guestId: string,
  assurance: LoginAssurance,
  opts: { expiresAt?: Date; via?: LoginVia } = {}
): Promise<string> {
  return Promise.resolve(
    storeSession(guestId, assurance, opts.expiresAt, opts.via)
  );
}

export { GUEST_COOKIE_NAME };
