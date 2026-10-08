import type { Day } from "@schellingboard/domain/event";
import type {
  Session,
  SessionCreateInput,
} from "@schellingboard/domain/session";
import {
  buildSessionInterval,
  type SessionInterval,
  type SessionPlacementCode,
} from "@schellingboard/domain/session-booking";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import {
  conflict,
  forbidden,
  invalid,
  notFound,
  versionConflict,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { SessionDeps } from "../ports";

export interface SessionBooking {
  dayId: string;
  title: string;
  description: string;
  closed: boolean;
  hostIds: string[];
  /** The start of the slot the host picked, the event's break included. */
  startTime: Date;
  durationMinutes: number;
  /** The host's own attendee maximum, 0 meaning none; absent takes the room's. */
  capacity?: number;
  proposalId?: string;
}

export const dayUnknown = () =>
  invalid("session.dayUnknown", "That day is no longer part of this event");
export const outsidePhase = (verb: string) =>
  forbidden(
    "event.notSchedulingPhase",
    `Sessions can only be ${verb} during the scheduling phase`
  );
export const hostNotInEvent = () =>
  forbidden("session.hostNotInEvent", "A host is not part of this event");
export const locationNotBookable = () =>
  forbidden(
    "session.locationNotBookable",
    "A location cannot be booked for this event"
  );

export function placementFailure(code: SessionPlacementCode): Failure {
  return code === "session.clash" ? conflict(code) : invalid(code);
}

// The session starts once the slot's leading break is over.
export function placed(
  booking: SessionBooking,
  day: Day,
  breakMinutes: number,
  locationIds: string[]
): { slot: SessionInterval; session: SessionCreateInput } {
  const slot = buildSessionInterval(booking.startTime, booking.durationMinutes);
  return {
    slot,
    session: {
      title: booking.title,
      description: booking.description,
      closed: booking.closed,
      hostIds: booking.hostIds,
      locationIds,
      startTime: new Date(slot.start.getTime() + breakMinutes * 60 * 1000),
      endTime: slot.end,
      capacity: 0,
      adminManaged: false,
      blocker: false,
      proposalId: booking.proposalId,
      eventId: day.eventId,
    },
  };
}

export async function hostsOutsideEvent(
  repos: SessionDeps["repos"],
  eventId: string,
  hostIds: string[]
): Promise<boolean> {
  const guestIds = new Set(
    (await repos.guests.listByEvent(eventId)).map((g) => g.id)
  );
  return !hostIds.every((id) => guestIds.has(id));
}

export const managedByOrganizer = (verb: string) =>
  forbidden("session.managedByOrganizer", `Cannot ${verb} via web app`);

export async function actingHost(
  actor: Actor,
  session: Session,
  repos: SessionDeps["repos"],
  verb: string
): Promise<Result<string>> {
  const acting = await actingGuest(actor, repos.guests);
  if (!acting.ok) return acting;
  return session.hosts.some((h) => h.id === acting.value)
    ? acting
    : forbidden("session.notHost", `Only a host may ${verb} this session`);
}

// For an update the repository refused: the session is gone or at another
// version than the edit was made from.
export async function changedMeanwhile(
  repos: SessionDeps["repos"],
  id: string
): Promise<Failure> {
  const current = await repos.sessions.findById(id);
  return current
    ? versionConflict(
        "session",
        current,
        "Someone changed this session while you edited it"
      )
    : notFound("session.notFound", "Session not found");
}
