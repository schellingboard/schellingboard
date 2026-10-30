import type { ChangeContext } from "@schellingboard/domain/change";
import type { Actor } from "./actor";

/** A site admin is named in the log; the admin password has no person. */
export const byAdmin = (actor: Actor, at: Date): ChangeContext => ({
  actor:
    actor.guest?.siteAdmin && actor.guest.level === "verified"
      ? { type: "admin", id: actor.guest.id }
      : { type: "admin" },
  at,
});

export const byGuest = (id: string, at: Date): ChangeContext => ({
  actor: { type: "guest", id },
  at,
});

/** A guest acting counts as the guest, even when they are also an admin. */
export const byActor = (actor: Actor, at: Date): ChangeContext =>
  actor.guest
    ? byGuest(actor.guest.id, at)
    : actor.admin
      ? byAdmin(actor, at)
      : { actor: { type: "system" }, at };
