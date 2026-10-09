import { sessionBookingWindowError } from "@schellingboard/domain/day-window";
import type { Location } from "@schellingboard/domain/location";
import { locationUnavailableError } from "@schellingboard/domain/location-unavailability";
import { inSchedPhase } from "@schellingboard/domain/phase";
import type { Session } from "@schellingboard/domain/session";
import {
  sessionCapacityError,
  sessionHasStarted,
  sessionPlacementError,
} from "@schellingboard/domain/session-booking";
import { sessionDurationError } from "@schellingboard/domain/slots";
import type { Actor } from "@/server/kernel/actor";
import {
  forbidden,
  invalid,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { SessionDeps } from "../ports";
import {
  actingHost,
  changedMeanwhile,
  dayUnknown,
  hostNotInEvent,
  hostsOutsideEvent,
  locationNotBookable,
  managedByOrganizer,
  outsidePhase,
  placed,
  placementFailure,
  type SessionBooking,
} from "./booking";
import { changeSession } from "./session-changes";

export interface UpdateSessionInput extends SessionBooking {
  sessionId: string;
  /** Several only when they are the rooms an organizer already gave it. */
  locationIds: string[];
  expectedVersion?: number;
}

export const updateSession =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    input: UpdateSessionInput,
    now: Date
  ): Promise<Result<Session>> => {
    const result = await deps.uow.run(async (tx) => {
      const day = await tx.days.findById(input.dayId);
      if (!day) return dayUnknown();
      const prev = await tx.sessions.findById(input.sessionId);
      if (!prev)
        return notFound(
          "session.notFound",
          `Cannot find session with ID ${input.sessionId}`
        );
      if (prev.eventId !== day.eventId) return dayUnknown();
      const event = await tx.events.findById(prev.eventId);
      if (!event || !inSchedPhase(event, now)) return outsidePhase("edited");
      if (prev.adminManaged || prev.blocker) return managedByOrganizer("edit");
      const host = await actingHost(actor, prev, tx, "edit");
      if (!host.ok) return host;

      const { slot, session } = placed(input, day, event.breakMinutes, []);
      const startChanged =
        session.startTime!.getTime() !== prev.startTime?.getTime();
      const endChanged = slot.end.getTime() !== prev.endTime?.getTime();
      if (startChanged && sessionHasStarted(prev, now))
        return forbidden(
          "session.started",
          "This session has already started, so it can no longer be moved"
        );
      // Only what the host is changing is theirs to answer for. An organizer
      // may have placed the session where a host could not book it.
      const windowError = sessionBookingWindowError(
        day,
        slot.start,
        slot.end,
        event.slotIncrementMinutes,
        { start: startChanged, end: endChanged }
      );
      if (windowError)
        return invalid("session.outsideBookingWindow", windowError);
      if (startChanged || endChanged) {
        const durationError = sessionDurationError(
          slot.start,
          slot.end,
          event.slotIncrementMinutes,
          event.maxSessionDuration
        );
        if (durationError)
          return invalid("session.durationNotAllowed", durationError);
      }
      if (await hostsOutsideEvent(tx, event.id, session.hostIds))
        return hostNotInEvent();
      const rooms = await chosenRooms(tx, event.id, prev, input.locationIds);
      if (!rooms.ok) return rooms;
      const chosen = rooms.value;
      session.locationIds = chosen.map((l) => l.id);
      const capacityError = sessionCapacityError(input.capacity);
      if (capacityError)
        return invalid("session.capacityInvalid", capacityError);
      session.capacity =
        input.capacity ??
        (chosen.length > 1 ? prev.capacity : chosen[0].capacity);
      const unavailable = await unavailableFailure(tx, event.id, prev, {
        locationIds: session.locationIds,
        start: session.startTime!,
        end: slot.end,
      });
      if (unavailable) return unavailable;
      const placement = sessionPlacementError(
        session,
        (await tx.sessions.listScheduledByEvent(event.id)).filter(
          (s) => s.id !== prev.id
        ),
        now,
        { allowPastStart: !startChanged }
      );
      if (placement) return placementFailure(placement);

      const updated = await changeSession(
        tx,
        prev.id,
        { ...session, expectedVersion: input.expectedVersion },
        { actor: { type: "guest", id: host.value }, at: now }
      );
      if (!updated) return changedMeanwhile(tx, prev.id);
      return ok({ updated, prev, host: host.value });
    });
    if (!result.ok) return result;
    const { updated, prev, host } = result.value;
    await deps.notifyCohostsAdded({
      now,
      session: updated,
      previousHostIds: prev.hosts.map((h) => h.id),
      changedById: host,
    });
    return ok(updated);
  };

// The rooms the event lets attendees book, plus the ones the session is
// already in: an organizer may have picked rooms attendees cannot book, and
// staying put is not a booking. Several rooms are an organizer's to give, so a
// host may keep the ones a session has or settle on one, not assemble a set.
async function chosenRooms(
  repos: SessionDeps["repos"],
  eventId: string,
  prev: Session,
  locationIds: string[]
): Promise<Result<Location[]>> {
  const bookable = new Map(
    (await repos.locations.listBookableByEvent(eventId)).map((l) => [l.id, l])
  );
  const currentIds = prev.locations.map((l) => l.id);
  for (const id of currentIds) {
    if (bookable.has(id)) continue;
    const current = await repos.locations.findById(id);
    if (current) bookable.set(current.id, current);
  }
  const requested = [...new Set(locationIds)];
  const chosen = requested.flatMap((id) => bookable.get(id) ?? []);
  const keepsRooms = requested.every((id) => currentIds.includes(id));
  if (
    chosen.length !== requested.length ||
    chosen.length === 0 ||
    (chosen.length > 1 && !keepsRooms)
  )
    return locationNotBookable();
  return ok(chosen);
}

async function unavailableFailure(
  repos: SessionDeps["repos"],
  eventId: string,
  prev: Session,
  next: { locationIds: string[]; start: Date; end: Date }
): Promise<Failure | null> {
  const periods = await repos.locationUnavailability.listByEvent(eventId);
  const currentIds = prev.locations.map((l) => l.id);
  for (const locationId of next.locationIds) {
    const error = locationUnavailableError(
      periods,
      { locationId, start: next.start, end: next.end },
      currentIds.includes(locationId) && prev.startTime && prev.endTime
        ? { locationId, start: prev.startTime, end: prev.endTime }
        : undefined
    );
    if (error) return invalid("session.locationUnavailable", error);
  }
  return null;
}
