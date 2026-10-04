import type { Actor } from "@/server/kernel/actor";
import { invalid, ok, type Result } from "@/server/kernel/result";
import type { PeopleDeps } from "../ports";
import { adminRequired, eventNotFound } from "./admin-guests";

interface EventGuestsInput {
  eventId: string;
  guestIds: string[];
}

export const assignGuestsToEvent =
  ({ repos }: PeopleDeps) =>
  async (actor: Actor, input: EventGuestsInput): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.events.findById(input.eventId))) return eventNotFound();

    const uniqueGuestIds = [...new Set(input.guestIds)];
    if (uniqueGuestIds.length > 0) {
      const existing = await repos.guests.findExistingIds(uniqueGuestIds);
      if (existing.length !== uniqueGuestIds.length) {
        return invalid("guest.unknown", "Guest not found");
      }
    }
    await repos.guests.assignToEvent(input.eventId, input.guestIds);
    return ok(undefined);
  };

export const removeGuestsFromEvent =
  ({ repos }: PeopleDeps) =>
  async (actor: Actor, input: EventGuestsInput): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.events.findById(input.eventId))) return eventNotFound();
    await repos.guests.removeFromEvent(input.eventId, input.guestIds);
    return ok(undefined);
  };
