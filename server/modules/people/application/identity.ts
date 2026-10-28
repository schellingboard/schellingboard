import type { Actor } from "@/server/kernel/actor";
import { forbidden, notFound, ok, type Result } from "@/server/kernel/result";
import type { PeopleDeps } from "../ports";

/** What the caller must store: the guest, and how the cookie proves it. */
export type Identity =
  { guestId: string; level: "open" | "verified" } | { guestId: null };

export const chooseGuest =
  ({ repos }: PeopleDeps) =>
  async (
    actor: Actor,
    { guestId }: { guestId: string }
  ): Promise<Result<Identity>> => {
    const creds = await repos.guests.getAuthCredentials(guestId);
    if (!creds) return notFound("guest.notFound", "Unknown user");
    if (!creds.authProtected) return ok({ guestId, level: "open" });
    // A protected name is kept only for a session already verified as it;
    // otherwise the user has to log in (password or emailed code) first.
    if (actor.guest?.id === guestId && actor.guest.level === "verified")
      return ok({ guestId, level: "verified" });
    return forbidden(
      "guest.protected",
      "This name is protected — a password or emailed code is needed"
    );
  };

export const signOut = (): Identity => ({ guestId: null });

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
