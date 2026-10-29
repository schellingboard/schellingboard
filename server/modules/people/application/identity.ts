import type { LoginAssurance } from "@schellingboard/domain/auth";
import type { Actor } from "@/server/kernel/actor";
import { forbidden, notFound, ok, type Result } from "@/server/kernel/result";
import {
  generateSessionToken,
  hashSessionToken,
  SESSION_LIFETIME_MS,
} from "@/utils/login-session-token";
import { realNow } from "@/utils/real-clock";
import type { PeopleDeps } from "../ports";

/** What the caller must store: the guest, and the cookie token that names the new session. */
export type SignedIn = {
  guestId: string;
  level: LoginAssurance;
  sessionToken: string;
};
export type Identity = SignedIn | { guestId: null };

/** A new row for every sign-in; the browser's previous one is revoked, never upgraded. */
export const signIn =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    {
      guestId,
      level,
      device = null,
    }: { guestId: string; level: LoginAssurance; device?: string | null }
  ): Promise<SignedIn> => {
    const token = generateSessionToken();
    const now = realNow();
    await uow.run(async (tx) => {
      if (actor.guest?.sessionId)
        await tx.loginSessions.delete(actor.guest.sessionId);
      await tx.loginSessions.create({
        id: hashSessionToken(token),
        guestId,
        eventId: null,
        assurance: level,
        createdAt: now,
        expiresAt: new Date(now.getTime() + SESSION_LIFETIME_MS),
        lastSeenAt: now,
        device,
      });
    });
    return { guestId, level, sessionToken: token };
  };

export const chooseGuest = (deps: PeopleDeps) => {
  const start = signIn(deps);
  return async (
    actor: Actor,
    { guestId, device }: { guestId: string; device?: string | null }
  ): Promise<Result<Identity>> => {
    const creds = await deps.repos.guests.getAuthCredentials(guestId);
    if (!creds) return notFound("guest.notFound", "Unknown user");
    if (!creds.authProtected)
      return ok(await start(actor, { guestId, level: "claimed", device }));
    // A protected name is kept only for a session already verified as it;
    // otherwise the user has to log in (password or emailed code) first.
    if (actor.guest?.id === guestId && actor.guest.level === "verified")
      return ok(await start(actor, { guestId, level: "verified", device }));
    return forbidden(
      "guest.protected",
      "This name is protected — a password or emailed code is needed"
    );
  };
};

export const signOut =
  ({ repos }: PeopleDeps) =>
  async (actor: Actor): Promise<Identity> => {
    if (actor.guest?.sessionId)
      await repos.loginSessions.delete(actor.guest.sessionId);
    return { guestId: null };
  };

/** The guest this browser acts as; a protected name needs its verified cookie. */
export const currentGuest =
  ({ repos }: PeopleDeps) =>
  async (
    actor: Actor
  ): Promise<{ guestId: string | null; awaitingLogin?: true }> => {
    if (!actor.guest) return { guestId: null };
    const creds = await repos.guests.getAuthCredentials(actor.guest.id);
    if (!creds) return { guestId: null };
    const proven = !creds.authProtected || actor.guest.level === "verified";
    return proven
      ? { guestId: actor.guest.id }
      : { guestId: null, awaitingLogin: true };
  };
