import type { Rsvp, Session } from "./session";

export type Actor =
  { type: "guest"; id: string } | { type: "admin" } | { type: "system" };

/** Who made a change, and when by their clock (which may be the dev fake clock). */
export type ChangeContext = { actor: Actor; at: Date };

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
  { before: Session; after: Session }
>;

/**
 * `rsvpGuestIds` is taken in the deleting transaction: the delete cascades to
 * the RSVPs, so afterwards nobody could look them up.
 */
export type SessionDeleted = ChangeOf<
  "session.deleted",
  "session",
  { session: Session; rsvpGuestIds: string[] }
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

export type Change =
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
    { actor, at }: ChangeContext
  ): SessionChanged {
    return {
      type: "session.changed",
      subjectType: "session",
      subjectId: after.id,
      eventId: after.eventId,
      actor,
      occurredAt: at,
      payload: { before, after },
    };
  },

  sessionDeleted(
    session: Session,
    rsvpGuestIds: string[],
    { actor, at }: ChangeContext
  ): SessionDeleted {
    return {
      type: "session.deleted",
      subjectType: "session",
      subjectId: session.id,
      eventId: session.eventId,
      actor,
      occurredAt: at,
      payload: { session, rsvpGuestIds },
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
};
