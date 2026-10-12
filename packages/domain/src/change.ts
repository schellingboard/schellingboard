import type { Day, Event } from "./event";
import type { Rsvp, Session } from "./session";

export type Actor =
  { type: "guest"; id: string } | { type: "admin" } | { type: "system" };

/** Who made a change, and when by their clock (which may be the dev fake clock). */
export type ChangeContext = {
  actor: Actor;
  at: Date;
  /** Set when the change follows from deleting or editing something else. */
  cascade?: true;
};

type ChangeOf<Type extends string, SubjectType extends string, Payload> = {
  type: Type;
  subjectType: SubjectType;
  subjectId: string;
  eventId: string | null;
  actor: Actor;
  occurredAt: Date;
  payload: Payload;
};

export type SessionCreated = ChangeOf<
  "session.created",
  "session",
  { session: Session }
>;

export type SessionChanged = ChangeOf<
  "session.changed",
  "session",
  { before: Session; after: Session; cascade?: true }
>;

/**
 * `rsvpGuestIds` is taken in the deleting transaction: the delete cascades to
 * the RSVPs, so afterwards nobody could look them up.
 */
export type SessionDeleted = ChangeOf<
  "session.deleted",
  "session",
  { session: Session; rsvpGuestIds: string[]; cascade?: true }
>;

/** The count after an RSVP was added or taken away: what every viewer shows. */
export type SessionAttendanceChanged = ChangeOf<
  "session.attendanceChanged",
  "session",
  { numRsvps: number }
>;

/** The RSVP itself is private to its guest: the count is the event's. */
export type RsvpAdded = ChangeOf<"rsvp.added", "rsvp", { rsvp: Rsvp }>;

export type RsvpRemoved = ChangeOf<
  "rsvp.removed",
  "rsvp",
  { sessionId: string; guestId: string }
>;

export type EventChanged = ChangeOf<"event.changed", "event", { event: Event }>;

/** The replica of a deleted event has nothing left to show. */
export type EventDeleted = ChangeOf<"event.deleted", "event", { event: Event }>;

export type DayCreated = ChangeOf<"day.created", "day", { day: Day }>;
export type DayChanged = ChangeOf<"day.changed", "day", { day: Day }>;
export type DayDeleted = ChangeOf<"day.deleted", "day", { day: Day }>;

export type Change =
  | EventChanged
  | EventDeleted
  | DayCreated
  | DayChanged
  | DayDeleted
  | SessionCreated
  | SessionChanged
  | SessionDeleted
  | SessionAttendanceChanged
  | RsvpAdded
  | RsvpRemoved;

/**
 * Who may receive a change (ADR 0014). `guests` and `admins` stand in for the
 * target's `persons` and `organizers` until persons exist.
 */
export type Audience =
  { kind: "event" } | { kind: "guests"; ids: string[] } | { kind: "admins" };

export function audienceOf(change: Change): Audience {
  switch (change.type) {
    case "session.created":
    case "session.changed":
    case "session.deleted":
    case "session.attendanceChanged":
    case "event.changed":
    case "event.deleted":
    case "day.created":
    case "day.changed":
    case "day.deleted":
      return { kind: "event" };
    case "rsvp.added":
      return { kind: "guests", ids: [change.payload.rsvp.guestId] };
    case "rsvp.removed":
      return { kind: "guests", ids: [change.payload.guestId] };
  }
}

/** Whom a feed connection serves: its guest, if any, and whether an admin. */
export type Viewer = { guestId: string | null; admin: boolean };

export function reaches(audience: Audience | null, viewer: Viewer): boolean {
  switch (audience?.kind) {
    case "event":
      return true;
    case "guests":
      return viewer.guestId !== null && audience.ids.includes(viewer.guestId);
    case "admins":
      return viewer.admin;
    default:
      return false;
  }
}

/**
 * A change as the log holds it: `seq` orders the log, `id` names one entry.
 * Entries written before audiences have none and go to no one.
 */
export type RecordedChange = Change & {
  seq: number;
  id: string;
  audience: Audience | null;
  commandKey: string | null;
};

export const changes = {
  sessionCreated(
    session: Session,
    { actor, at }: ChangeContext
  ): SessionCreated {
    return {
      type: "session.created",
      subjectType: "session",
      subjectId: session.id,
      eventId: session.eventId,
      actor,
      occurredAt: at,
      payload: { session },
    };
  },

  sessionChanged(
    before: Session,
    after: Session,
    { actor, at, cascade }: ChangeContext
  ): SessionChanged {
    return {
      type: "session.changed",
      subjectType: "session",
      subjectId: after.id,
      eventId: after.eventId,
      actor,
      occurredAt: at,
      payload: { before, after, ...(cascade && { cascade }) },
    };
  },

  sessionDeleted(
    session: Session,
    rsvpGuestIds: string[],
    { actor, at, cascade }: ChangeContext
  ): SessionDeleted {
    return {
      type: "session.deleted",
      subjectType: "session",
      subjectId: session.id,
      eventId: session.eventId,
      actor,
      occurredAt: at,
      payload: { session, rsvpGuestIds, ...(cascade && { cascade }) },
    };
  },

  sessionAttendanceChanged(
    session: Session,
    numRsvps: number,
    { actor, at }: ChangeContext
  ): SessionAttendanceChanged {
    return {
      type: "session.attendanceChanged",
      subjectType: "session",
      subjectId: session.id,
      eventId: session.eventId,
      actor,
      occurredAt: at,
      payload: { numRsvps },
    };
  },

  rsvpAdded(
    rsvp: Rsvp,
    eventId: string,
    { actor, at }: ChangeContext
  ): RsvpAdded {
    return {
      type: "rsvp.added",
      subjectType: "rsvp",
      subjectId: rsvp.id,
      eventId,
      actor,
      occurredAt: at,
      payload: { rsvp },
    };
  },

  rsvpRemoved(
    rsvpId: string,
    sessionId: string,
    guestId: string,
    eventId: string,
    { actor, at }: ChangeContext
  ): RsvpRemoved {
    return {
      type: "rsvp.removed",
      subjectType: "rsvp",
      subjectId: rsvpId,
      eventId,
      actor,
      occurredAt: at,
      payload: { sessionId, guestId },
    };
  },

  eventChanged(event: Event, { actor, at }: ChangeContext): EventChanged {
    return {
      type: "event.changed",
      subjectType: "event",
      subjectId: event.id,
      eventId: event.id,
      actor,
      occurredAt: at,
      payload: { event },
    };
  },

  eventDeleted(event: Event, { actor, at }: ChangeContext): EventDeleted {
    return {
      type: "event.deleted",
      subjectType: "event",
      subjectId: event.id,
      eventId: event.id,
      actor,
      occurredAt: at,
      payload: { event },
    };
  },

  dayCreated(day: Day, { actor, at }: ChangeContext): DayCreated {
    return dayChange("day.created", day, actor, at);
  },

  dayChanged(day: Day, { actor, at }: ChangeContext): DayChanged {
    return dayChange("day.changed", day, actor, at);
  },

  dayDeleted(day: Day, { actor, at }: ChangeContext): DayDeleted {
    return dayChange("day.deleted", day, actor, at);
  },
};

function dayChange<
  Type extends DayCreated["type"] | DayChanged["type"] | DayDeleted["type"],
>(type: Type, day: Day, actor: Actor, occurredAt: Date) {
  return {
    type,
    subjectType: "day" as const,
    subjectId: day.id,
    eventId: day.eventId,
    actor,
    occurredAt,
    payload: { day },
  };
}
