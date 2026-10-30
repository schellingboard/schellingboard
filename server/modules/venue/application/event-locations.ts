import type { Actor } from "@/server/kernel/actor";
import { byAdmin } from "@/server/kernel/change-context";
import { ok, type Result } from "@/server/kernel/result";
import type { VenueDeps } from "../ports";
import {
  recordLocationChanged,
  recordLocationRemoved,
} from "./location-changes";
import { adminRequired, eventNotFound, locationNotFound } from "./locations";

export interface EventLocationsInput {
  eventId: string;
  locationIds: string[];
}

export const assignLocationsToEvent =
  ({ uow }: VenueDeps) =>
  async (
    actor: Actor,
    input: EventLocationsInput,
    now: Date
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    const unique = [...new Set(input.locationIds)];
    return uow.run(async (tx) => {
      if (!(await tx.events.findById(input.eventId))) return eventNotFound();
      if (unique.length > 0) {
        const existing = await tx.locations.findExistingIds(unique);
        if (existing.length !== unique.length) return locationNotFound();
      }
      const had = new Set(
        await tx.locations.listLocationIdsByEvent(input.eventId)
      );
      await tx.locations.assignToEvent(input.eventId, unique);
      for (const id of unique.filter((id) => !had.has(id)))
        await recordLocationChanged(
          tx,
          id,
          [input.eventId],
          byAdmin(actor, now)
        );
      return ok(undefined);
    });
  };

export const removeLocationsFromEvent =
  ({ uow }: VenueDeps) =>
  async (
    actor: Actor,
    input: EventLocationsInput,
    now: Date
  ): Promise<Result<void>> => {
    if (!actor.admin) return adminRequired();
    return uow.run(async (tx) => {
      if (!(await tx.events.findById(input.eventId))) return eventNotFound();
      const had = new Set(
        await tx.locations.listLocationIdsByEvent(input.eventId)
      );
      await tx.locations.removeFromEvent(input.eventId, input.locationIds);
      for (const id of new Set(input.locationIds)) {
        const location = had.has(id) && (await tx.locations.findById(id));
        if (location)
          recordLocationRemoved(
            tx,
            location,
            [input.eventId],
            byAdmin(actor, now)
          );
      }
      return ok(undefined);
    });
  };
