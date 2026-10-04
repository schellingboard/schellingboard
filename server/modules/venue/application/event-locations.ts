import type { Actor } from "@/server/kernel/actor";
import { ok, type Result } from "@/server/kernel/result";
import type { VenueDeps } from "../ports";
import { adminRequired, eventNotFound, locationNotFound } from "./locations";

export interface EventLocationsInput {
  eventId: string;
  locationIds: string[];
}

export const assignLocationsToEvent =
  ({ repos }: VenueDeps) =>
  async (actor: Actor, input: EventLocationsInput): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.events.findById(input.eventId))) return eventNotFound();

    const unique = [...new Set(input.locationIds)];
    if (unique.length > 0) {
      const existing = await repos.locations.findExistingIds(unique);
      if (existing.length !== unique.length) return locationNotFound();
    }
    await repos.locations.assignToEvent(input.eventId, unique);
    return ok(undefined);
  };

export const removeLocationsFromEvent =
  ({ repos }: VenueDeps) =>
  async (actor: Actor, input: EventLocationsInput): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.events.findById(input.eventId))) return eventNotFound();
    await repos.locations.removeFromEvent(input.eventId, input.locationIds);
    return ok(undefined);
  };
