import type { Comment } from "@schellingboard/domain/comment";
import type { VoteChoice, Vote } from "@schellingboard/domain/vote";
import type {
  Rsvp,
  SessionProposal,
  Session,
  SessionCreateInput,
} from "@schellingboard/domain/session";
import type {
  Location,
  LocationUnavailability,
} from "@schellingboard/domain/location";
import type { AuthCodePurpose, AuthCode } from "@schellingboard/domain/auth";
import type {
  EmailSettings,
  ProfilePrompt,
  ProfileContact,
  Guest,
  CompleteGuest,
  Attendee,
  EventAttendee,
} from "@schellingboard/domain/guest";
import type { SiteSettings } from "@schellingboard/domain/site-settings";
import type {
  Event,
  EventMeetingSettings,
  Day,
} from "@schellingboard/domain/event";

// ── Site settings ────────────────────────────────────────────────────────────

export interface SettingsRepository {
  /** The singleton settings row, falling back to defaults when unset. */
  get(): Promise<SiteSettings>;
  /** Upserts the singleton row and returns the merged settings. */
  update(patch: Partial<SiteSettings>): Promise<SiteSettings>;
}

// ── Days ─────────────────────────────────────────────────────────────────────

export interface DaysRepository {
  list(): Promise<Day[]>;
  listByEvent(eventId: string): Promise<Day[]>;
  findById(id: string): Promise<Day | undefined>;
  create(data: Omit<Day, "id">): Promise<Day>;
  update(
    id: string,
    patch: Partial<Omit<Day, "id" | "eventId">>
  ): Promise<Day | undefined>;
  /** Deletes the day and every session that overlaps the day's window. */
  delete(id: string): Promise<void>;
}

export interface LocationUnavailabilityRepository {
  /** Ordered by start. */
  listByEvent(eventId: string): Promise<LocationUnavailability[]>;
  findById(id: string): Promise<LocationUnavailability | undefined>;
  create(
    data: Omit<LocationUnavailability, "id">
  ): Promise<LocationUnavailability>;
  /** One insert statement: either every period is stored or none is. */
  createMany(data: Omit<LocationUnavailability, "id">[]): Promise<void>;
  delete(id: string): Promise<void>;
}

// ── Events ────────────────────────────────────────────────────────────────────

type EventDerivedFields = "id" | "slug" | "firstDayStart" | "lastDayStart";

export interface EventsRepository {
  list(): Promise<Event[]>;
  findById(id: string): Promise<Event | undefined>;
  findByName(name: string): Promise<Event | undefined>;
  /** Finds the event with the given slug. Slugs are unique. */
  findBySlug(slug: string): Promise<Event | undefined>;
  /**
   * Creates the event with a slug derived from its name. Rejects when another
   * event already has that slug (unique constraint). Meeting settings are
   * optional and fall back to the schema's defaults.
   */
  create(
    data: Omit<Event, EventDerivedFields | keyof EventMeetingSettings> &
      Partial<EventMeetingSettings>
  ): Promise<Event>;
  update(
    id: string,
    patch: Partial<Omit<Event, EventDerivedFields>>
  ): Promise<Event | undefined>;
  /** Deletes the event and all records referencing it (cascades via DB FK). */
  delete(id: string): Promise<void>;
}

// ── Guests ────────────────────────────────────────────────────────────────────

/** Server-only auth state of a guest; never send to the client. */
export type GuestAuthCredentials = {
  authProtected: boolean;
  passwordHash: string | null;
};

/** Input for issuing a token; `id` and `attempts` are filled in on insert. */
export type NewAuthCode = {
  guestId: string;
  purpose: AuthCodePurpose;
  salt: string;
  codeHash: string;
  createdAt: Date;
  expiresAt: Date;
};

export interface AuthCodesRepository {
  /**
   * Stores a new token for the guest, replacing any previous one of the same
   * purpose — only the most recently issued token of a purpose can be valid.
   */
  replace(code: NewAuthCode): Promise<void>;
  /**
   * The guest's current token of `purpose`, or null if none exists or it
   * expired at `now`.
   */
  findActive(
    guestId: string,
    purpose: AuthCodePurpose,
    now: Date
  ): Promise<AuthCode | null>;
  recordFailedAttempt(id: string): Promise<void>;
  /** Deletes the token, so a successful use can never be replayed. */
  consume(id: string): Promise<void>;
}

/** Input for creating a guest. Everything else is filled in after creation. */
export type NewGuest = {
  name: string;
  info: { email: string };
};

/** A guest paired with their email and whether they are assigned to a given event. */
export type EventGuestRow = {
  id: string;
  name: string;
  email: string;
  assigned: boolean;
};

/** A page of guests plus the total count of rows matching the same filter. */
export type EventGuestPage = {
  rows: EventGuestRow[];
  total: number;
};

/** A page of complete guests plus the total count matching the same filter. */
export type GuestPage = {
  rows: CompleteGuest[];
  total: number;
};

export interface GuestsRepository {
  /**
   * Every guest with basic public fields only — no extended profile
   * (basedIn, prompts, languages, contacts). Pages embed this list in their
   * client payload (name/host selectors), so it must stay lean; use
   * findById/listAttendees where the extended profile is shown.
   */
  list(): Promise<Guest[]>;
  /** Every user with their private info (email). For admin export/lookup. */
  listFull(): Promise<CompleteGuest[]>;
  listByEvent(eventId: string): Promise<Guest[]>;
  /**
   * Server-side paginated + searchable global user list. `query` matches name
   * or email (case-insensitive substring, LIKE metacharacters matched
   * literally). Ordered by name with id tiebreaker.
   */
  search(opts: {
    query?: string;
    limit: number;
    offset: number;
  }): Promise<GuestPage>;
  /**
   * All guests as attendees (public profile fields plus whether they host any
   * session), ordered by name with id tiebreaker. Search, filtering, sorting
   * and pagination all happen in memory on top of this, in the browser (see
   * app/(site)/guests/directory-view.ts): attendee counts don't warrant a SQL
   * or persisted search index. `now` bounds `openToMeetings`: availability whose
   * slots have all passed leaves nothing anyone can book.
   */
  listAttendees(now: Date): Promise<Attendee[]>;
  /**
   * One event's guests, with the profile fields a list of people shows. Scoped
   * where `listAttendees` is global: a screen describing one event's slot has
   * no use for a scan of every guest on the site.
   */
  listAttendeesByEvent(eventId: string): Promise<EventAttendee[]>;
  /**
   * Assigned events for many guests in one query, ordered by event name.
   * Every requested id is present in the result; guests without assignments
   * map to [].
   */
  listEventsByGuests(
    guestIds: string[]
  ): Promise<Map<string, { id: string; name: string }[]>>;
  /**
   * Server-side paginated + searchable guest list scoped to an event's
   * assignment. `assigned` filters by membership (undefined = all); `query`
   * matches name or email (case-insensitive substring). Ordered by name.
   */
  searchForEventAssignment(
    eventId: string,
    opts: {
      query?: string;
      assigned?: boolean;
      limit: number;
      offset: number;
    }
  ): Promise<EventGuestPage>;
  findById(id: string): Promise<CompleteGuest | undefined>;
  /** Server-only: protection flag + password hash, for credential checks. */
  getAuthCredentials(id: string): Promise<GuestAuthCredentials | null>;
  /** Returns false when the guest doesn't exist. */
  setAuthProtection(id: string, creds: GuestAuthCredentials): Promise<boolean>;
  // Matches the email case-insensitively.
  findByEmail(email: string): Promise<CompleteGuest | undefined>;
  /** Guests whose email matches any of `emails`, compared case-insensitively. */
  findByEmails(emails: string[]): Promise<CompleteGuest[]>;
  create(data: NewGuest): Promise<CompleteGuest>;
  /**
   * Atomically creates a guest, or returns the existing one if a guest with
   * the same email (case-insensitive) already exists. Safe under concurrent
   * calls with the same email (backed by a DB-level unique index).
   */
  findOrCreateByEmail(
    data: NewGuest
  ): Promise<{ guest: CompleteGuest; created: boolean }>;
  // Usage: an admin updates a user (name and email). Email settings are not
  // touched: those belong to the guest, via updateProfile.
  update(
    id: string,
    data: { name: string; info: { email: string } }
  ): Promise<CompleteGuest | undefined>;
  // Usage: a user updates their own public profile (name and profile fields).
  // `profileUpdatedAt` is set to `now` only if a public profile field actually
  // changed — saving the form unchanged must not push you to the top of the
  // "recently updated" list.
  updateProfile(
    id: string,
    data: {
      name: string;
      aboutMe: string | null;
      avatarUrl: string | null;
      pronouns: string | null;
      basedIn: string | null;
      prompts: ProfilePrompt[] | null;
      languages: string[] | null;
      contacts: ProfileContact[] | null;
    },
    now: Date
  ): Promise<CompleteGuest | undefined>;
  // Usage: a user updates their own email notification settings. Kept apart
  // from updateProfile: settings are private and independent of the public
  // profile.
  updateEmailSettings(
    id: string,
    settings: EmailSettings
  ): Promise<CompleteGuest | undefined>;
  /** Deletes the guest and all records referencing them (votes, RSVPs, host links, event assignments). */
  delete(id: string): Promise<void>;
  findExistingIds(ids: string[]): Promise<string[]>;
  assignToEvent(eventId: string, guestIds: string[]): Promise<void>;
  removeFromEvent(eventId: string, guestIds: string[]): Promise<void>;
  /**
   * Matches `rows` to existing guests by email (case-insensitive), creates
   * the missing ones, and assigns every resulting guest to each event in
   * `eventIds`. Existing guests are left unchanged. Runs in a single
   * transaction so a failure partway through leaves no partial writes.
   */
  importAndAssign(
    rows: { name: string; email: string }[],
    eventIds: string[]
  ): Promise<{ created: number }>;
}

// ── Locations ─────────────────────────────────────────────────────────────────

/** A location paired with whether it is assigned to a given event. */
export type EventLocationRow = {
  id: string;
  name: string;
  capacity: number;
  assigned: boolean;
};

/** A page of locations plus the total count of rows matching the same filter. */
export type EventLocationPage = {
  rows: EventLocationRow[];
  total: number;
};

export interface LocationsRepository {
  /** All locations, ordered by sortIndex. */
  list(): Promise<Location[]>;
  /**
   * Server-side paginated + searchable location list scoped to an event's
   * assignment. `assigned` filters by membership (undefined = all); `query`
   * matches the name (case-insensitive substring). Ordered by name.
   */
  searchForEventAssignment(
    eventId: string,
    opts: {
      query?: string;
      assigned?: boolean;
      limit: number;
      offset: number;
    }
  ): Promise<EventLocationPage>;
  /** Locations assigned to the given event, ordered by sortIndex. */
  listByEvent(eventId: string): Promise<Location[]>;
  /**
   * Bookable locations assigned to the given event, ordered by sortIndex —
   * what attendees may pick when scheduling a session.
   */
  listBookableByEvent(eventId: string): Promise<Location[]>;
  findById(id: string): Promise<Location | undefined>;
  create(data: Omit<Location, "id">): Promise<Location>;
  update(id: string, data: Omit<Location, "id">): Promise<Location | undefined>;
  /** Deletes the location and all session/event links referencing it. */
  delete(id: string): Promise<void>;
  /** Number of sessions linked to this location. */
  countSessionLinks(id: string): Promise<number>;
  /**
   * Session-link counts for many locations in one query. Every requested id
   * is present in the result; locations without links map to 0.
   */
  countSessionLinksByLocations(ids: string[]): Promise<Map<string, number>>;
  /** IDs of events this location is assigned to. */
  listEventIds(id: string): Promise<string[]>;
  /**
   * Event IDs for many locations in one query. Every requested id is present
   * in the result; locations without assignments map to [].
   */
  listEventIdsByLocations(ids: string[]): Promise<Map<string, string[]>>;
  /** IDs of locations assigned to the given event. */
  listLocationIdsByEvent(eventId: string): Promise<string[]>;
  /**
   * Replaces the location's event assignments. Does not touch session_locations:
   * a session already scheduled at this location keeps that link even if its
   * event is dropped here, so it stops appearing in that event's schedule grid
   * (see listByEvent) while the underlying link is untouched.
   */
  setEventIds(id: string, eventIds: string[]): Promise<void>;
  /** Returns the subset of `ids` that exist in the locations table. */
  findExistingIds(ids: string[]): Promise<string[]>;
  /** Atomically adds the location to the given events (idempotent). */
  assignToEvent(eventId: string, locationIds: string[]): Promise<void>;
  /**
   * Atomically removes the location from the given events. Does not touch
   * session_locations, so sessions already scheduled there stop appearing in
   * the event's schedule grid (see listByEvent) but keep the stale link.
   */
  removeFromEvent(eventId: string, locationIds: string[]): Promise<void>;
  /**
   * Moves the location one position up or down in the sort order.
   * Normalizes sortIndex values to consecutive integers as a side effect.
   * Returns false if the location is already at the boundary or unknown.
   */
  move(id: string, direction: "up" | "down"): Promise<boolean>;
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export type SessionUpdateInput = Partial<
  Omit<SessionCreateInput, "hostIds" | "locationIds">
> & {
  hostIds?: string[];
  locationIds?: string[];
};

/** A page of sessions plus the total count of rows matching the same filter. */
export type SessionPage = {
  rows: Session[];
  total: number;
};

export interface SessionsRepository {
  list(): Promise<Session[]>;
  listScheduled(): Promise<Session[]>;
  listByEvent(eventId: string): Promise<Session[]>;
  listScheduledByEvent(eventId: string): Promise<Session[]>;
  listHostedByGuest(guestId: string): Promise<Session[]>;
  listRsvpdByGuest(guestId: string): Promise<Session[]>;
  /**
   * Server-side paginated + searchable session list for an event. `query`
   * matches the title or a host name (case-insensitive substring). Ordered by
   * title.
   */
  searchByEvent(
    eventId: string,
    opts: { query?: string; limit: number; offset: number }
  ): Promise<SessionPage>;
  findById(id: string): Promise<Session | undefined>;
  /**
   * How many people attended, or null when nobody has recorded it (0 is a
   * recorded value meaning "held, nobody came"). Host-only data: the caller
   * must have already established that the requester hosts this session.
   *
   * Deliberately not a field of `Session`, which is serialised to every
   * visitor by the [eventSlug] layout — see docs/dev/adr/0007.
   */
  getAttendeeCount(sessionId: string): Promise<number | null>;
  /** Records, changes (a number) or clears (null) the attendee count. */
  setAttendeeCount(sessionId: string, count: number | null): Promise<void>;
  create(data: SessionCreateInput): Promise<Session>;
  /**
   * When `hostIds` is given, any RSVPs by the session's hosts are removed
   * in the same transaction: hosts don't RSVP to their own session.
   */
  update(id: string, patch: SessionUpdateInput): Promise<Session>;
  delete(id: string): Promise<void>;
  /**
   * Finds a scheduled session in the event that overlaps [start, end) and
   * shares at least one of the given locations, excluding `excludeId`. Used
   * for conflict checks; returns only the fields needed for an error message.
   */
  findLocationConflict(
    eventId: string,
    start: Date,
    end: Date,
    locationIds: string[],
    excludeId?: string
  ): Promise<{ id: string; title: string } | undefined>;
}

// ── Session reminders ─────────────────────────────────────────────────────────

export type ReminderKind = "headsUp" | "followUp";

export type ReminderKey = {
  sessionId: string;
  guestId: string;
  kind: ReminderKind;
};

/** One (session, host, kind) the dispatcher may owe a reminder for. */
export type DueReminderCandidate = ReminderKey & {
  dueTime: Date;

  sessionTitle: string;
  sessionStartTime: Date;
  sessionEndTime: Date;
  sessionLocationNames: string[];
  /**
   * Whether a count is already recorded — a flag, not the number. Suppressing
   * the follow-up (FR-011) is the dispatcher's decision; the value itself is
   * host-only and stays inside db/.
   */
  hasRecordedCount: boolean;

  eventSlug: string;
  eventTimezone: string;

  /**
   * Null when the host has no address on file. That skips the mail only — the
   * in-app notification still goes out and a row is still written.
   */
  guestEmail: string | null;
  /**
   * The EmailSettings key for *this* kind — `sessionHeadsUp` or
   * `attendeeCountReminder` — which gates the **email** alone (FR-017). It has
   * no bearing on the notification.
   */
  reminderOptIn: boolean;

  storedDueTime: Date | null;
  storedClaimedAt: Date | null;
  storedNotifiedAt: Date | null;
};

export interface RemindersRepository {
  /**
   * Every (scheduled session with hosts × host × kind) whose reminder could
   * be due by `now`, joined to its event, its hosts' addresses and
   * preferences, its recorded-count flag and its stored row. Everything the
   * dispatcher and both email templates read is on the candidate, because
   * dispatch never queries once it starts sending. Eligibility is decided by
   * the pure predicates in utils/reminder-schedule.ts, not by SQL.
   */
  listCandidates(now: Date): Promise<DueReminderCandidate[]>;
  /**
   * Atomically claims the reminder for `dueTime`, in one write transaction.
   *
   * `claimed` is false when another tick already holds it — i.e. the stored
   * row carries the same due time with `claimedAt` set. `claimedAt` is the
   * guard, deliberately not `sentAt`: a reminder with nothing to mail must
   * block a second claim without ever having sent anything.
   *
   * `notifyOwed` says whether the in-app notification for THIS due time still
   * has to be created. The claim clears `notifiedAt` whenever it advances the
   * row to a new due time, so a reschedule owes a fresh notification (FR-024)
   * while a mail retry against an unchanged due time does not (FR-016).
   * Meaningless when `claimed` is false.
   */
  claim(
    key: ReminderKey,
    dueTime: Date,
    now: Date
  ): Promise<{ claimed: boolean; notifyOwed: boolean }>;
  /** Records that the notification for the current due time exists. */
  markNotified(key: ReminderKey, now: Date): Promise<void>;
  /**
   * A real email was confirmed sent: sets `sentAt`, clears `firstFailedAt`.
   * The only writer of `sentAt`, so that column always means exactly "an email
   * went out for this due time".
   */
  markSent(key: ReminderKey, now: Date): Promise<void>;
  /**
   * Settles the claim when there is nothing to mail — an opted-out host, no
   * address, or an instance with no mail configured. Clears `firstFailedAt`
   * (there is nothing to retry) and leaves `sentAt` null. `claimedAt` from the
   * winning claim is what stops the reminder being reprocessed.
   */
  markSkipped(key: ReminderKey): Promise<void>;
  /**
   * Failed send. Sets `firstFailedAt` when unset, then either clears
   * `claimedAt` to re-arm for the next tick, or — once the first failure is
   * older than `abandonAfterMs` — leaves it set so the reminder is never
   * retried again. Never touches `sentAt`: a failed send is not a sent one.
   * Reports which happened, so the caller can log the abandonment.
   */
  markFailed(
    key: ReminderKey,
    now: Date,
    abandonAfterMs: number
  ): Promise<{ abandoned: boolean }>;
}

// ── RSVPs ─────────────────────────────────────────────────────────────────────

export interface RsvpsRepository {
  listByGuest(guestId: string): Promise<Rsvp[]>;
  listBySession(sessionId: string): Promise<Rsvp[]>;
  /**
   * RSVPs for many sessions in one query. Every requested id is present in
   * the result; sessions without RSVPs map to [].
   */
  listBySessions(sessionIds: string[]): Promise<Map<string, Rsvp[]>>;
  create(data: { sessionId: string; guestId: string }): Promise<Rsvp>;
  /**
   * Atomically creates an RSVP unless the session already holds `capacity`
   * RSVPs from other guests. A guest re-adding their own existing RSVP always
   * succeeds. Returns null when the session is full.
   */
  createIfUnderCapacity(data: {
    sessionId: string;
    guestId: string;
    capacity: number;
  }): Promise<Rsvp | null>;
  deleteBySessionAndGuest(sessionId: string, guestId: string): Promise<void>;
}

// ── Session Proposals ─────────────────────────────────────────────────────────

export type SessionProposalCreateInput = {
  eventId: string;
  title: string;
  description?: string;
  hostIds: string[];
  durationMinutes?: number;
  cohostWanted?: boolean;
  cohostWantedNote?: string;
  createdTime: Date;
};

export type SessionProposalUpdateInput = {
  title?: string;
  description?: string;
  hostIds?: string[];
  durationMinutes?: number | null;
  cohostWanted?: boolean;
  cohostWantedNote?: string | null;
  /** The update only applies while the proposal's updatedTime is still this. */
  expectedUpdatedTime?: Date;
  updatedTime: Date;
};

/** A page of proposals plus the total count of rows matching the same filter. */
export type SessionProposalPage = {
  rows: SessionProposal[];
  total: number;
};

export interface SessionProposalsRepository {
  listByEvent(eventId: string): Promise<SessionProposal[]>;
  listByHost(guestId: string): Promise<SessionProposal[]>;
  /**
   * Server-side paginated + searchable proposal list for an event. `query`
   * matches the title or a host name (case-insensitive substring). Ordered by
   * title.
   */
  searchByEvent(
    eventId: string,
    opts: { query?: string; limit: number; offset: number }
  ): Promise<SessionProposalPage>;
  findById(id: string): Promise<SessionProposal | undefined>;
  create(data: SessionProposalCreateInput): Promise<SessionProposal>;
  /** Undefined, changing nothing, if the proposal is gone or not at `expectedUpdatedTime`. */
  update(
    id: string,
    patch: SessionProposalUpdateInput
  ): Promise<SessionProposal | undefined>;
  /** False, changing nothing, unless the proposal wants a host and the guest isn't one. */
  addHost(id: string, guestId: string, updatedTime: Date): Promise<boolean>;
  delete(id: string): Promise<void>;
}

// ── Comments ──────────────────────────────────────────────────────────────────

/**
 * Scope-agnostic comment operations. A comment is attached to exactly one
 * subject — a session proposal, a scheduled session or a guest's profile —
 * but finding, editing, liking and deleting work identically for all, so they
 * live here. Attaching comments to a subject is a SubjectCommentsRepository.
 */
export interface CommentsRepository {
  findById(commentId: string): Promise<Comment | undefined>;
  update(id: string, data: { body: string; editedTime: Date }): Promise<void>;
  toggleLike(data: {
    commentId: string;
    guestId: string;
    createdTime: Date;
  }): Promise<boolean>;
  /**
   * Erases the comment. One with replies is kept as a tombstone holding
   * nothing but its place in the thread; one without is removed outright,
   * along with any tombstone ancestors it was the last reply to.
   */
  delete(id: string): Promise<void>;
}

/**
 * Comments attached to one kind of subject. Which kind is fixed by the
 * repository itself — `proposalComments`, `sessionComments` and
 * `profileComments` on {@link Repositories} — so `subjectId` below is always a
 * proposal, session or profile id respectively.
 */
export interface SubjectCommentsRepository {
  /** All comments on the subject, oldest first, likes included. */
  list(subjectId: string): Promise<Comment[]>;
  /**
   * The subject a comment is attached to, or undefined when the comment
   * doesn't exist or belongs to a subject of another kind.
   */
  findSubjectId(commentId: string): Promise<string | undefined>;
  create(data: {
    subjectId: string;
    authorId: string;
    parentId?: string;
    body: string;
    createdTime: Date;
  }): Promise<Comment>;
}

// ── Votes ─────────────────────────────────────────────────────────────────────

export interface VotesRepository {
  listByGuestAndEvent(guestId: string, eventId: string): Promise<Vote[]>;
  create(data: {
    proposalId: string;
    guestId: string;
    choice: VoteChoice;
  }): Promise<Vote>;
  upsert(data: {
    proposalId: string;
    guestId: string;
    choice: VoteChoice;
  }): Promise<void>;
  deleteByGuestAndProposal(guestId: string, proposalId: string): Promise<void>;
  deleteByProposal(proposalId: string): Promise<void>;
  deleteByProposalAndGuests(
    proposalId: string,
    guestIds: string[]
  ): Promise<void>;
}

// ── Meetings ───────────────────────────────────────────────────────────────────

export type MeetingPoint = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  sortIndex: number;
};

export interface MeetingPointsRepository {
  /** An event's suggested places to meet, in the organizer's order. */
  listByEvent(eventId: string): Promise<MeetingPoint[]>;
  create(data: Omit<MeetingPoint, "id">): Promise<MeetingPoint>;
  update(
    id: string,
    patch: Partial<Omit<MeetingPoint, "id" | "eventId">>
  ): Promise<MeetingPoint | undefined>;
  delete(id: string): Promise<void>;
}

export interface MeetingAvailabilityRepository {
  /**
   * The slot starts (ISO) a guest declared for an event, chronologically. An
   * empty result means they are not bookable — the same state as never having
   * switched meetings on.
   */
  listByGuestAndEvent(guestId: string, eventId: string): Promise<Date[]>;
  /**
   * The guests who declared one particular slot, for "who could I meet at
   * 14:30?". Ids only: the caller already holds the attendee list it needs to
   * turn them into people.
   */
  listGuestsBySlot(eventId: string, slotStart: Date): Promise<string[]>;
  /** Replaces a guest's whole declared set for the event. */
  replaceForGuest(
    guestId: string,
    eventId: string,
    slotStarts: Date[]
  ): Promise<void>;
  /**
   * Drops every guest's declared slots for the event. Used when the event's
   * slot increment changes: slots are derived from it, so a coarser grid would
   * re-read a declared half-hour as a full hour the guest never offered.
   */
  deleteByEvent(eventId: string): Promise<void>;
}

/**
 * Stored meeting states. "expired" is deliberately absent: a pending request
 * whose slot has passed is expired by definition, and deriving that on read
 * needs no scheduler.
 */
export type MeetingStatus = "pending" | "accepted" | "declined" | "canceled";

export type Meeting = {
  id: string;
  eventId: string;
  requesterId: string;
  recipientId: string;
  /** ISO instants; the slot the requester picked. */
  slotStart: Date;
  slotEnd: Date;
  /** Where to meet, as agreed at request time. Never empty. */
  meetingPoint: string;
  message: string;
  /** What the canceller said, if anything. Empty on a meeting still standing. */
  cancelNote: string;
  status: MeetingStatus;
  createdAt: Date;
  respondedAt?: Date;
};

export type MeetingRequestOutcome =
  { meeting: Meeting } | { refused: "cap" | "duplicate" };

/**
 * A meeting as it is asked for. Everything a request carries; the rest of a
 * meeting is what happens to it afterwards — its status, when it was answered,
 * and a note from whoever called it off.
 */
export type MeetingCreateInput = Omit<
  Meeting,
  "id" | "status" | "respondedAt" | "cancelNote"
>;

export interface MeetingsRepository {
  findById(id: string): Promise<Meeting | undefined>;
  /**
   * Every meeting the guest is part of at the event, in either direction,
   * ordered by slot. Callers filter by status: the schedule shows pending and
   * accepted, clash detection only accepted.
   */
  listByGuestAndEvent(guestId: string, eventId: string): Promise<Meeting[]>;
  /**
   * Every meeting still standing that overlaps [start, end), whoever it is
   * between: what the grid's booking flow needs to know who is already taken.
   */
  listLiveOverlapping(
    eventId: string,
    start: Date,
    end: Date
  ): Promise<Meeting[]>;
  /**
   * Requests this guest has sent and not heard back on, for the organizer's
   * cap. `now` bounds it: a pending request whose slot has passed is expired
   * by definition, and an expired request is not outstanding.
   */
  countOpenByRequester(
    requesterId: string,
    eventId: string,
    now: Date
  ): Promise<number>;
  create(data: MeetingCreateInput): Promise<Meeting>;
  /**
   * Both refusals and the insert in one transaction. Two separate awaits leave
   * a window a double submit walks straight through — the same hazard
   * {@link RsvpsRepository.createIfUnderCapacity} exists for, and the reason
   * "already asked them" is decided here rather than read off a constraint
   * violation.
   *
   * "duplicate" means a live request from the same requester to the same
   * recipient already overlaps that time; declined and cancelled ones do not
   * count, so the pair can agree on a slot they had earlier passed on.
   */
  createIfAllowed(
    data: MeetingCreateInput,
    cap: number,
    now: Date
  ): Promise<MeetingRequestOutcome>;
  /**
   * Moves the meeting to `status`, but only from one of `from` — undefined
   * when it is in some other state, which is how a caller learns that someone
   * (a cancelling requester, a second tab) got there first.
   *
   * `cancelNote` rides along in the same statement, so a note is stored only
   * where the move it explains happened.
   */
  updateStatus(
    id: string,
    status: MeetingStatus,
    respondedAt: Date,
    from: MeetingStatus[],
    cancelNote?: string
  ): Promise<Meeting | undefined>;
}

// ── Notifications ──────────────────────────────────────────────────────────────

/**
 * What happened, as one of the guest's email-setting keys. The two channels
 * share a taxonomy: the setting decides whether mail goes out, never whether
 * the in-app notification is recorded.
 */
export type NotificationType = keyof EmailSettings;

export type Notification = {
  id: string;
  guestId: string;
  type: NotificationType;
  /** One line, in the past tense: "Anna commented on your session". */
  text: string;
  /** Site-relative path to whatever happened, e.g. `/eventslug?viewSession=x`. */
  url: string;
  createdAt: Date;
  /** Unset while unread. */
  readAt?: Date;
};

export interface NotificationsRepository {
  /** One notification, iff it belongs to `guestId`. */
  findForGuest(guestId: string, id: string): Promise<Notification | undefined>;
  /** Newest first. */
  listByGuest(
    guestId: string,
    opts?: { limit?: number; offset?: number }
  ): Promise<Notification[]>;
  /** Drives the nav badge. */
  countUnread(guestId: string): Promise<number>;
  /** Everything the guest has, read or not — what paging is measured against. */
  countByGuest(guestId: string): Promise<number>;
  create(data: Omit<Notification, "id" | "readAt">): Promise<Notification>;
  /**
   * Marks one notification read, iff it belongs to `guestId`; false when it
   * does not exist or is someone else's. Already-read rows keep their original
   * timestamp. `readAt` comes from the caller so the dev fake clock reaches it.
   */
  markRead(guestId: string, id: string, readAt: Date): Promise<boolean>;
  /**
   * What the notifications page's selection buttons act through. Ids that
   * aren't `guestId`'s are skipped rather than rejected: the selection comes
   * from a browser, so a stale or forged id must not take the whole batch
   * down with it. An empty selection is a no-op.
   */
  markManyRead(guestId: string, ids: string[], readAt: Date): Promise<void>;
  /** @see {@link markManyRead} for how ids not the guest's are treated. */
  deleteMany(guestId: string, ids: string[]): Promise<void>;
}

// ── Push notifications ────────────────────────────────────────────────────────

/**
 * One browser that has agreed to be notified. `endpoint` is the push service's
 * address for that browser and identifies it: a device is not a guest, and a
 * shared laptop moves to whoever turned notifications on last.
 */
export type PushSubscription = {
  id: string;
  guestId: string;
  endpoint: string;
  /** The browser's public key, for encrypting the payload to it. */
  p256dh: string;
  auth: string;
  createdAt: Date;
};

/** The instance's application server keys, as web-push generates them. */
export type VapidKeys = { publicKey: string; privateKey: string };

export interface PushRepository {
  listSubscriptions(guestId: string): Promise<PushSubscription[]>;
  findSubscription(endpoint: string): Promise<PushSubscription | undefined>;
  /**
   * Upserts by endpoint, so re-subscribing a device never duplicates it: the
   * row moves to `guestId` with the new keys and keeps its original createdAt.
   */
  saveSubscription(data: Omit<PushSubscription, "id">): Promise<void>;
  deleteSubscription(endpoint: string): Promise<void>;
  /**
   * The stored VAPID pair, calling `generate` and storing the result the first
   * time. Never regenerates: the public key is baked into every subscription
   * already handed out, and nothing tells a browser to ask for a new one.
   */
  vapidKeys(generate: () => VapidKeys, now: Date): Promise<VapidKeys>;
}

// ── Images ─────────────────────────────────────────────────────────────────────

export interface ImageResourceRepository<Id> {
  validate(
    buffer: Buffer
  ): Promise<{ buffer: Buffer; ext: string } | { error: string }>;
  save(id: Id, buffer: Buffer, ext: string): Promise<string>;
  delete(id: Id): Promise<void>;
}
