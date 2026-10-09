import { sessionBookingWindowError } from "@schellingboard/domain/day-window";
import { locationUnavailableError } from "@schellingboard/domain/location-unavailability";
import { inSchedPhase } from "@schellingboard/domain/phase";
import type { Session } from "@schellingboard/domain/session";
import {
  sessionCapacityError,
  sessionPlacementError,
} from "@schellingboard/domain/session-booking";
import { sessionDurationError } from "@schellingboard/domain/slots";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { invalid, notFound, ok, type Result } from "@/server/kernel/result";
import type { SessionDeps } from "../ports";
import {
  dayUnknown,
  hostNotInEvent,
  hostsOutsideEvent,
  locationNotBookable,
  outsidePhase,
  placed,
  placementFailure,
  type SessionBooking,
} from "./booking";

export interface CreateSessionInput extends SessionBooking {
  locationId: string;
}

export const createSession =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    input: CreateSessionInput,
    now: Date
  ): Promise<Result<Session>> => {
    const result = await deps.uow.run(async (tx) => {
      // A session is attributed to its hosts, so creating needs a name actually
      // selected, not merely one that isn't being falsely claimed.
      const acting = await actingGuest(actor, tx.guests);
      if (!acting.ok) return acting;
      const day = await tx.days.findById(input.dayId);
      if (!day) return dayUnknown();
      const event = await tx.events.findById(day.eventId);
      if (!event || !inSchedPhase(event, now)) return outsidePhase("created");

      const { slot, session } = placed(input, day, event.breakMinutes, [
        input.locationId,
      ]);
      const windowError = sessionBookingWindowError(
        day,
        slot.start,
        slot.end,
        event.slotIncrementMinutes
      );
      if (windowError)
        return invalid("session.outsideBookingWindow", windowError);
      const durationError = sessionDurationError(
        slot.start,
        slot.end,
        event.slotIncrementMinutes,
        event.maxSessionDuration
      );
      if (durationError)
        return invalid("session.durationNotAllowed", durationError);
      if (await hostsOutsideEvent(tx, event.id, session.hostIds))
        return hostNotInEvent();
      if (input.proposalId) {
        const proposal = await tx.sessionProposals.findById(input.proposalId);
        if (proposal?.eventId !== event.id)
          return notFound("proposal.notFound", "Proposal not found");
      }
      // Exactly the set the session form offers: assigned to the event and open
      // to self-booking.
      const location = (await tx.locations.listBookableByEvent(event.id)).find(
        (l) => l.id === input.locationId
      );
      if (!location) return locationNotBookable();
      const capacityError = sessionCapacityError(input.capacity);
      if (capacityError)
        return invalid("session.capacityInvalid", capacityError);
      session.capacity = input.capacity ?? location.capacity;
      const unavailableError = locationUnavailableError(
        await tx.locationUnavailability.listByEvent(event.id),
        { locationId: location.id, start: session.startTime!, end: slot.end }
      );
      if (unavailableError)
        return invalid("session.locationUnavailable", unavailableError);
      const placement = sessionPlacementError(
        session,
        await tx.sessions.listScheduledByEvent(event.id),
        now
      );
      if (placement) return placementFailure(placement);

      const created = await tx.sessions.create(session);
      return ok({ created, actingId: acting.value });
    });
    if (!result.ok) return result;
    const { created, actingId } = result.value;
    await deps.notifyCohostsAdded({
      now,
      session: created,
      previousHostIds: [],
      changedById: actingId,
    });
    return ok(created);
  };
