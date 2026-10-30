import type { Actor } from "@/server/kernel/actor";
import { byAdmin } from "@/server/kernel/change-context";
import { recordingShownGuests } from "@/server/kernel/shown-guests";
import { invalid, ok, type Result } from "@/server/kernel/result";
import type { PeopleDeps } from "../ports";
import { adminRequired, eventNotFound } from "./admin-guests";

interface EventGuestsInput {
  eventId: string;
  guestIds: string[];
}

export const assignGuestsToEvent =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: EventGuestsInput,
    now: Date
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      if (!(await tx.events.findById(input.eventId))) return eventNotFound();

      const uniqueGuestIds = [...new Set(input.guestIds)];
      if (uniqueGuestIds.length > 0) {
        const existing = await tx.guests.findExistingIds(uniqueGuestIds);
        if (existing.length !== uniqueGuestIds.length) {
          return invalid("guest.unknown", "Guest not found");
        }
      }
      await recordingShownGuests(
        tx,
        [input.eventId],
        () => tx.guests.assignToEvent(input.eventId, input.guestIds),
        byAdmin(actor, now)
      );
      return ok(undefined);
    });
  };

export const removeGuestsFromEvent =
  ({ uow }: PeopleDeps) =>
  async (
    actor: Actor,
    input: EventGuestsInput,
    now: Date
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      if (!(await tx.events.findById(input.eventId))) return eventNotFound();
      await recordingShownGuests(
        tx,
        [input.eventId],
        () => tx.guests.removeFromEvent(input.eventId, input.guestIds),
        byAdmin(actor, now)
      );
      return ok(undefined);
    });
  };
