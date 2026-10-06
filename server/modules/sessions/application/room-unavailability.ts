import type { LocationUnavailability } from "@schellingboard/domain/location";
import type { Actor } from "@/server/kernel/actor";
import {
  forbidden,
  invalid,
  notFound,
  ok,
  type Result,
} from "@/server/kernel/result";
import type { SessionDeps } from "../ports";

export interface LocationUnavailabilityInput {
  eventId: string;
  locationIds: string[];
  start: Date | undefined;
  end: Date | undefined;
}

const adminRequired = () => forbidden("admin.required", "Unauthorized");
const eventNotFound = () => notFound("event.notFound", "Event not found");
const valid = (d: Date | undefined): d is Date =>
  d !== undefined && !isNaN(d.getTime());

export const listLocationUnavailability =
  ({ repos }: SessionDeps) =>
  async (
    actor: Actor,
    input: { eventId: string }
  ): Promise<Result<LocationUnavailability[]>> => {
    if (!actor.admin) return adminRequired();
    if (!(await repos.events.findById(input.eventId))) return eventNotFound();
    return ok(await repos.locationUnavailability.listByEvent(input.eventId));
  };

export const addLocationUnavailability =
  ({ repos }: SessionDeps) =>
  async (
    actor: Actor,
    input: LocationUnavailabilityInput
  ): Promise<Result<LocationUnavailability[]>> => {
    if (!actor.admin) return adminRequired();
    const { start, end } = input;
    if (!valid(start) || !valid(end)) {
      return invalid("unavailability.timeInvalid", "Invalid start or end time");
    }
    if (end <= start) {
      return invalid(
        "unavailability.endBeforeStart",
        "End must be after start"
      );
    }
    if (input.locationIds.length === 0) {
      return invalid("unavailability.roomRequired", "Pick at least one room");
    }
    if (!(await repos.events.findById(input.eventId))) return eventNotFound();

    const rooms = await repos.locations.listByEvent(input.eventId);
    const roomIds = new Set(rooms.map((room) => room.id));
    if (!input.locationIds.every((id) => roomIds.has(id))) {
      return invalid(
        "unavailability.roomNotInEvent",
        "That room is not part of this event"
      );
    }

    return ok(
      await repos.locationUnavailability.createMany(
        [...new Set(input.locationIds)].map((locationId) => ({
          eventId: input.eventId,
          locationId,
          start,
          end,
        }))
      )
    );
  };

export const deleteLocationUnavailability =
  ({ repos }: SessionDeps) =>
  async (
    actor: Actor,
    input: { id: string }
  ): Promise<Result<LocationUnavailability>> => {
    if (!actor.admin) return adminRequired();
    const period = await repos.locationUnavailability.findById(input.id);
    if (!period) return notFound("unavailability.notFound", "Not found");
    await repos.locationUnavailability.delete(input.id);
    return ok(period);
  };
