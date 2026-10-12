import type { CommentRef } from "./comment";
import type { Day, Event } from "./event";
import type { Guest } from "./guest";
import type { Location, LocationUnavailability } from "./location";
import type { Meeting, MeetingPoint } from "./meeting";
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

/** Recorded once for each event the location is assigned to. */
export type LocationChanged = ChangeOf<
  "location.changed",
  "location",
  { location: Location }
>;

/** The location left this event, or was deleted. */
export type LocationRemoved = ChangeOf<
  "location.removed",
  "location",
  { location: Location }
>;

export type UnavailabilityAdded = ChangeOf<
  "unavailability.added",
  "unavailability",
  { period: LocationUnavailability }
>;

export type UnavailabilityRemoved = ChangeOf<
  "unavailability.removed",
  "unavailability",
  { period: LocationUnavailability }
>;

/**
 * A guest the event shows everyone: a member, or a host who is not one. Also
 * recorded when a shown guest's public fields change.
 */
export type GuestChanged = ChangeOf<
  "guest.changed",
  "guest",
  { guest: Guest; member: boolean }
>;

/** The guest left the event's shown set, or was deleted. */
export type GuestRemoved = ChangeOf<
  "guest.removed",
  "guest",
  Record<string, never>
>;

export type MeetingPointChanged = ChangeOf<
  "meetingPoint.changed",
  "meetingPoint",
  { point: MeetingPoint }
>;

export type MeetingPointRemoved = ChangeOf<
  "meetingPoint.removed",
  "meetingPoint",
  { point: MeetingPoint }
>;

/** A 1-on-1 in any state; only the two guests it is between hear of it. */
export type MeetingChanged = ChangeOf<
  "meeting.changed",
  "meeting",
  { meeting: Meeting }
>;

/** Deleting a guest takes their 1-on-1s with them. */
export type MeetingDeleted = ChangeOf<
  "meeting.deleted",
  "meeting",
  { meeting: Meeting }
>;

/** A 1-on-1 was asked for; recorded so the recipient is told. */
export type MeetingRequested = ChangeOf<
  "meeting.requested",
  "meeting",
  Record<string, never>
>;

/** A 1-on-1 was answered or called off; the actor is who did it. */
export type MeetingAnswered = ChangeOf<
  "meeting.answered",
  "meeting",
  { outcome: "accepted" | "declined" | "canceled" }
>;

/** The slot starts a guest declared themselves free, as ISO instants. */
export type AvailabilityChanged = ChangeOf<
  "availability.changed",
  "availability",
  { guestId: string; slotStarts: string[] }
>;

/** The hosts a session gained, other than whoever made the change. */
export type SessionCohostsAdded = ChangeOf<
  "session.cohostsAdded",
  "session",
  { hostIds: string[] }
>;

/** Only the reaction that notifies the other hosts reads this. */
export type ProposalJoined = ChangeOf<
  "proposal.joined",
  "proposal",
  { joinerId: string }
>;

/** Only the reaction that notifies the thread reads this. */
export type CommentCreated = ChangeOf<
  "comment.created",
  "comment",
  {
    subject: { kind: "proposal" | "session" | "profile"; id: string };
    comment: CommentRef;
  }
>;

export type Change =
  | SessionCohostsAdded
  | ProposalJoined
  | CommentCreated
  | GuestChanged
  | GuestRemoved
  | MeetingPointChanged
  | MeetingPointRemoved
  | MeetingChanged
  | MeetingDeleted
  | MeetingRequested
  | MeetingAnswered
  | AvailabilityChanged
  | LocationChanged
  | LocationRemoved
  | UnavailabilityAdded
  | UnavailabilityRemoved
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
  | { kind: "event" }
  | { kind: "guests"; ids: string[] }
  | { kind: "admins" }
  /** Logged for reactions only; no feed viewer is told. */
  | { kind: "none" };

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
    case "location.changed":
    case "location.removed":
    case "unavailability.added":
    case "unavailability.removed":
    case "guest.changed":
    case "guest.removed":
    case "meetingPoint.changed":
    case "meetingPoint.removed":
      return { kind: "event" };
    case "meeting.changed":
    case "meeting.deleted":
      return {
        kind: "guests",
        ids: [
          change.payload.meeting.requesterId,
          change.payload.meeting.recipientId,
        ],
      };
    case "availability.changed":
      return { kind: "guests", ids: [change.payload.guestId] };
    case "meeting.requested":
    case "meeting.answered":
    case "session.cohostsAdded":
    case "proposal.joined":
    case "comment.created":
      return { kind: "none" };
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

  meetingRequested(
    meeting: Pick<Meeting, "id" | "eventId">,
    { actor, at }: ChangeContext
  ): MeetingRequested {
    return {
      type: "meeting.requested",
      subjectType: "meeting",
      subjectId: meeting.id,
      eventId: meeting.eventId,
      actor,
      occurredAt: at,
      payload: {},
    };
  },

  meetingAnswered(
    meeting: Pick<Meeting, "id" | "eventId">,
    outcome: MeetingAnswered["payload"]["outcome"],
    { actor, at }: ChangeContext
  ): MeetingAnswered {
    return {
      type: "meeting.answered",
      subjectType: "meeting",
      subjectId: meeting.id,
      eventId: meeting.eventId,
      actor,
      occurredAt: at,
      payload: { outcome },
    };
  },

  sessionCohostsAdded(
    session: Pick<Session, "id" | "eventId">,
    hostIds: string[],
    { actor, at }: ChangeContext
  ): SessionCohostsAdded {
    return {
      type: "session.cohostsAdded",
      subjectType: "session",
      subjectId: session.id,
      eventId: session.eventId,
      actor,
      occurredAt: at,
      payload: { hostIds },
    };
  },

  proposalJoined(
    proposalId: string,
    eventId: string,
    joinerId: string,
    { actor, at }: ChangeContext
  ): ProposalJoined {
    return {
      type: "proposal.joined",
      subjectType: "proposal",
      subjectId: proposalId,
      eventId,
      actor,
      occurredAt: at,
      payload: { joinerId },
    };
  },

  commentCreated(
    comment: CommentRef,
    subject: CommentCreated["payload"]["subject"],
    eventId: string | null,
    { actor, at }: ChangeContext
  ): CommentCreated {
    return {
      type: "comment.created",
      subjectType: "comment",
      subjectId: comment.id,
      eventId,
      actor,
      occurredAt: at,
      payload: {
        subject,
        comment: {
          id: comment.id,
          author: comment.author,
          createdTime: comment.createdTime,
        },
      },
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

  locationChanged(
    location: Location,
    eventId: string,
    { actor, at }: ChangeContext
  ): LocationChanged {
    return {
      type: "location.changed",
      subjectType: "location",
      subjectId: location.id,
      eventId,
      actor,
      occurredAt: at,
      payload: { location },
    };
  },

  locationRemoved(
    location: Location,
    eventId: string,
    { actor, at }: ChangeContext
  ): LocationRemoved {
    return {
      type: "location.removed",
      subjectType: "location",
      subjectId: location.id,
      eventId,
      actor,
      occurredAt: at,
      payload: { location },
    };
  },

  unavailabilityAdded(
    period: LocationUnavailability,
    { actor, at }: ChangeContext
  ): UnavailabilityAdded {
    return {
      type: "unavailability.added",
      subjectType: "unavailability",
      subjectId: period.id,
      eventId: period.eventId,
      actor,
      occurredAt: at,
      payload: { period },
    };
  },

  unavailabilityRemoved(
    period: LocationUnavailability,
    { actor, at }: ChangeContext
  ): UnavailabilityRemoved {
    return {
      type: "unavailability.removed",
      subjectType: "unavailability",
      subjectId: period.id,
      eventId: period.eventId,
      actor,
      occurredAt: at,
      payload: { period },
    };
  },

  guestChanged(
    guest: Guest,
    member: boolean,
    eventId: string,
    { actor, at }: ChangeContext
  ): GuestChanged {
    return {
      type: "guest.changed",
      subjectType: "guest",
      subjectId: guest.id,
      eventId,
      actor,
      occurredAt: at,
      payload: { guest, member },
    };
  },

  guestRemoved(
    guestId: string,
    eventId: string,
    { actor, at }: ChangeContext
  ): GuestRemoved {
    return {
      type: "guest.removed",
      subjectType: "guest",
      subjectId: guestId,
      eventId,
      actor,
      occurredAt: at,
      payload: {},
    };
  },

  meetingPointChanged(
    point: MeetingPoint,
    { actor, at }: ChangeContext
  ): MeetingPointChanged {
    return {
      type: "meetingPoint.changed",
      subjectType: "meetingPoint",
      subjectId: point.id,
      eventId: point.eventId,
      actor,
      occurredAt: at,
      payload: { point },
    };
  },

  meetingPointRemoved(
    point: MeetingPoint,
    { actor, at }: ChangeContext
  ): MeetingPointRemoved {
    return {
      type: "meetingPoint.removed",
      subjectType: "meetingPoint",
      subjectId: point.id,
      eventId: point.eventId,
      actor,
      occurredAt: at,
      payload: { point },
    };
  },

  meetingChanged(
    meeting: Meeting,
    { actor, at }: ChangeContext
  ): MeetingChanged {
    return {
      type: "meeting.changed",
      subjectType: "meeting",
      subjectId: meeting.id,
      eventId: meeting.eventId,
      actor,
      occurredAt: at,
      payload: { meeting },
    };
  },

  meetingDeleted(
    meeting: Meeting,
    { actor, at }: ChangeContext
  ): MeetingDeleted {
    return {
      type: "meeting.deleted",
      subjectType: "meeting",
      subjectId: meeting.id,
      eventId: meeting.eventId,
      actor,
      occurredAt: at,
      payload: { meeting },
    };
  },

  availabilityChanged(
    guestId: string,
    eventId: string,
    slotStarts: string[],
    { actor, at }: ChangeContext
  ): AvailabilityChanged {
    return {
      type: "availability.changed",
      subjectType: "availability",
      subjectId: guestId,
      eventId,
      actor,
      occurredAt: at,
      payload: { guestId, slotStarts },
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
