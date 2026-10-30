import { getRepositories } from "@/db/container";
import {
  hashSessionToken,
  SESSION_LIFETIME_MS,
} from "@/utils/login-session-token";
import { realNow } from "@/utils/real-clock";
import {
  readGuestIdentity,
  resolveActor,
  type CookieReader,
  type SessionLookup,
} from "./actor";

const REFRESH_AFTER_MS = 24 * 60 * 60 * 1000;

const lookupSession: SessionLookup = async (token) => {
  const id = hashSessionToken(token);
  const sessions = getRepositories().loginSessions;
  const now = realNow();
  const row = await sessions.findLive(id, now);
  if (row && now.getTime() - row.lastSeenAt.getTime() >= REFRESH_AFTER_MS) {
    await sessions.refresh(
      id,
      now,
      new Date(now.getTime() + SESSION_LIFETIME_MS)
    );
  }
  return row ? { id, guestId: row.guestId, level: row.assurance } : null;
};

export const actorOf = (cookies: CookieReader) =>
  resolveActor(cookies, lookupSession);

export const guestOfCookie = (value: string | undefined) =>
  readGuestIdentity(value, lookupSession);
