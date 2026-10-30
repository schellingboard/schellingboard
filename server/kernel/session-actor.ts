import { getRepositories } from "@/db/container";
import { hashSessionToken } from "@/utils/login-session-token";
import { realNow } from "@/utils/real-clock";
import {
  readGuestIdentity,
  resolveActor,
  type CookieReader,
  type SessionLookup,
} from "./actor";

const lookupSession: SessionLookup = async (token) => {
  const id = hashSessionToken(token);
  const row = await getRepositories().loginSessions.findLive(id, realNow());
  return row ? { id, guestId: row.guestId, level: row.assurance } : null;
};

export const actorOf = (cookies: CookieReader) =>
  resolveActor(cookies, lookupSession);

export const guestOfCookie = (value: string | undefined) =>
  readGuestIdentity(value, lookupSession);
