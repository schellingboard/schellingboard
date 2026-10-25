import type { ChangeContext } from "@schellingboard/domain/change";
import type { Actor } from "./actor";

export const byAdmin = (at: Date): ChangeContext => ({
  actor: { type: "admin" },
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
      ? byAdmin(at)
      : { actor: { type: "system" }, at };
