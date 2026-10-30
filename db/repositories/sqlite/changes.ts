import { and, asc, eq, gt, gte, inArray, lte, min, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type { ChangesRepository } from "../interfaces";
import type {
  Actor,
  Audience,
  Change,
  CommentCreated,
  VoteCast,
  VoteWithdrawn,
  LoggedProposal,
  MeetingAnswered,
  RecordedChange,
} from "@schellingboard/domain/change";
import type { Day, Event } from "@schellingboard/domain/event";
import type {
  Location,
  LocationUnavailability,
} from "@schellingboard/domain/location";
import type { Guest } from "@schellingboard/domain/guest";
import type { Meeting, MeetingPoint } from "@schellingboard/domain/meeting";
import type { Rsvp, Session } from "@schellingboard/domain/session";

type DB = BetterSQLite3Database<typeof schema>;
type ChangeRow = typeof schema.changes.$inferSelect;

// JSON keeps a Date as its ISO string; these put the instants back.
function reviveSession(json: Session): Session {
  const raw = json as unknown as Record<string, string | undefined>;
  return {
    ...json,
    startTime: raw.startTime ? new Date(raw.startTime) : undefined,
    endTime: raw.endTime ? new Date(raw.endTime) : undefined,
  };
}

const EVENT_DATES = [
  "firstDayStart",
  "lastDayStart",
  "proposalPhaseStart",
  "proposalPhaseEnd",
  "votingPhaseStart",
  "votingPhaseEnd",
  "schedulingPhaseStart",
  "schedulingPhaseEnd",
] as const;

function reviveProposal(json: LoggedProposal): LoggedProposal {
  const raw = json as unknown as Record<string, string>;
  return {
    ...json,
    createdTime: new Date(raw.createdTime),
    updatedTime: new Date(raw.updatedTime),
  };
}

function reviveEvent(json: Event): Event {
  const raw = json as unknown as Record<string, string | undefined>;
  return {
    ...json,
    ...Object.fromEntries(
      EVENT_DATES.map((key) => [key, raw[key] ? new Date(raw[key]) : undefined])
    ),
  };
}

function reviveDay(json: Day): Day {
  const raw = json as unknown as Record<string, string>;
  return {
    ...json,
    start: new Date(raw.start),
    end: new Date(raw.end),
    startBookings: new Date(raw.startBookings),
    endBookings: new Date(raw.endBookings),
  };
}

function revivePeriod(json: LocationUnavailability): LocationUnavailability {
  const raw = json as unknown as Record<string, string>;
  return { ...json, start: new Date(raw.start), end: new Date(raw.end) };
}

function reviveMeeting(json: Meeting): Meeting {
  const raw = json as unknown as Record<string, string | undefined>;
  return {
    ...json,
    slotStart: new Date(raw.slotStart!),
    slotEnd: new Date(raw.slotEnd!),
    createdAt: new Date(raw.createdAt!),
    respondedAt: raw.respondedAt ? new Date(raw.respondedAt) : undefined,
  };
}

function actorOf(row: ChangeRow): Actor {
  if (row.actorType === "guest" && row.actorId) {
    return { type: "guest", id: row.actorId };
  }
  if (row.actorType === "admin") {
    return row.actorId ? { type: "admin", id: row.actorId } : { type: "admin" };
  }
  return { type: "system" };
}

function toRecordedChange(row: ChangeRow): RecordedChange {
  const common = {
    seq: row.seq,
    id: row.id,
    subjectId: row.subjectId,
    eventId: row.eventId,
    actor: actorOf(row),
    occurredAt: new Date(row.occurredAt),
    audience: row.audience as Audience | null,
    commandKey: row.commandKey,
  };
  switch (row.type) {
    case "session.changed": {
      const payload = row.payload as {
        before: Session;
        after: Session;
        cascade?: true;
        tellAttendees?: true;
      };
      return {
        ...common,
        type: "session.changed",
        subjectType: "session",
        payload: {
          before: reviveSession(payload.before),
          after: reviveSession(payload.after),
          ...(payload.cascade && { cascade: true as const }),
          ...(payload.tellAttendees && { tellAttendees: true as const }),
        },
      };
    }
    case "session.deleted": {
      const payload = row.payload as {
        session: Session;
        rsvpGuestIds: string[];
        cascade?: true;
        tellAttendees?: true;
      };
      return {
        ...common,
        type: "session.deleted",
        subjectType: "session",
        payload: {
          session: reviveSession(payload.session),
          rsvpGuestIds: payload.rsvpGuestIds,
          ...(payload.cascade && { cascade: true as const }),
          ...(payload.tellAttendees && { tellAttendees: true as const }),
        },
      };
    }
    case "event.changed":
    case "event.deleted": {
      const payload = row.payload as { event: Event };
      return {
        ...common,
        type: row.type,
        subjectType: "event",
        payload: { event: reviveEvent(payload.event) },
      };
    }
    case "day.created":
    case "day.changed":
    case "day.deleted": {
      const payload = row.payload as { day: Day };
      return {
        ...common,
        type: row.type,
        subjectType: "day",
        payload: { day: reviveDay(payload.day) },
      };
    }
    case "location.changed":
    case "location.removed":
      return {
        ...common,
        type: row.type,
        subjectType: "location",
        payload: row.payload as { location: Location },
      };
    case "unavailability.added":
    case "unavailability.removed": {
      const payload = row.payload as { period: LocationUnavailability };
      return {
        ...common,
        type: row.type,
        subjectType: "unavailability",
        payload: { period: revivePeriod(payload.period) },
      };
    }
    case "guest.changed":
      return {
        ...common,
        type: "guest.changed",
        subjectType: "guest",
        payload: row.payload as { guest: Guest; member: boolean },
      };
    case "guest.removed":
      return {
        ...common,
        type: "guest.removed",
        subjectType: "guest",
        payload: {},
      };
    case "meetingPoint.changed":
    case "meetingPoint.removed":
      return {
        ...common,
        type: row.type,
        subjectType: "meetingPoint",
        payload: row.payload as { point: MeetingPoint },
      };
    case "meeting.changed":
    case "meeting.deleted": {
      const payload = row.payload as { meeting: Meeting };
      return {
        ...common,
        type: row.type,
        subjectType: "meeting",
        payload: { meeting: reviveMeeting(payload.meeting) },
      };
    }
    case "meeting.requested":
      return {
        ...common,
        type: "meeting.requested",
        subjectType: "meeting",
        payload: {},
      };
    case "meeting.answered":
      return {
        ...common,
        type: "meeting.answered",
        subjectType: "meeting",
        payload: row.payload as MeetingAnswered["payload"],
      };
    case "availability.changed":
      return {
        ...common,
        type: "availability.changed",
        subjectType: "availability",
        payload: row.payload as { guestId: string; slotStarts: string[] },
      };
    case "session.created": {
      const payload = row.payload as { session: Session };
      return {
        ...common,
        type: "session.created",
        subjectType: "session",
        payload: { session: reviveSession(payload.session) },
      };
    }
    case "session.attendanceChanged":
      return {
        ...common,
        type: "session.attendanceChanged",
        subjectType: "session",
        payload: row.payload as { numRsvps: number },
      };
    case "rsvp.added":
      return {
        ...common,
        type: "rsvp.added",
        subjectType: "rsvp",
        payload: row.payload as { rsvp: Rsvp },
      };
    case "session.cohostsAdded":
      return {
        ...common,
        type: "session.cohostsAdded",
        subjectType: "session",
        payload: row.payload as { hostIds: string[] },
      };
    case "proposal.created":
    case "proposal.changed":
    case "proposal.deleted": {
      const payload = row.payload as { proposal: LoggedProposal };
      return {
        ...common,
        type: row.type,
        subjectType: "proposal",
        payload: { proposal: reviveProposal(payload.proposal) },
      };
    }
    case "proposal.joined":
      return {
        ...common,
        type: "proposal.joined",
        subjectType: "proposal",
        payload: row.payload as { joinerId: string },
      };
    case "comment.created": {
      const payload = row.payload as CommentCreated["payload"];
      const raw = payload.comment as unknown as Record<string, string>;
      return {
        ...common,
        type: "comment.created",
        subjectType: "comment",
        payload: {
          subject: payload.subject,
          comment: {
            ...payload.comment,
            createdTime: new Date(raw.createdTime),
          },
        },
      };
    }
    case "rsvp.removed":
      return {
        ...common,
        type: "rsvp.removed",
        subjectType: "rsvp",
        payload: row.payload as { sessionId: string; guestId: string },
      };
    case "vote.cast":
      return {
        ...common,
        type: "vote.cast",
        subjectType: "vote",
        payload: row.payload as VoteCast["payload"],
      };
    case "vote.withdrawn":
      return {
        ...common,
        type: "vote.withdrawn",
        subjectType: "vote",
        payload: row.payload as VoteWithdrawn["payload"],
      };
    default:
      throw new Error(`Unknown change type in the log: ${row.type}`);
  }
}

// A reader skips types it does not know, such as rows written by a newer
// version before a rollback, rather than stopping at them.
const KNOWN_TYPES: RecordedChange["type"][] = [
  "guest.changed",
  "guest.removed",
  "meetingPoint.changed",
  "meetingPoint.removed",
  "meeting.changed",
  "meeting.deleted",
  "meeting.requested",
  "meeting.answered",
  "availability.changed",
  "location.changed",
  "location.removed",
  "unavailability.added",
  "unavailability.removed",
  "event.changed",
  "event.deleted",
  "day.created",
  "day.changed",
  "day.deleted",
  "session.created",
  "session.changed",
  "session.deleted",
  "session.attendanceChanged",
  "rsvp.added",
  "rsvp.removed",
  "vote.cast",
  "vote.withdrawn",
  "proposal.created",
  "proposal.changed",
  "proposal.deleted",
  "proposal.joined",
  "comment.created",
  "session.cohostsAdded",
];

const PRUNED_CURSOR = "changes.pruned";

export class SqliteChangesRepository implements ChangesRepository {
  constructor(private db: DB) {}

  async append(
    change: Change,
    meta: Pick<RecordedChange, "audience" | "commandKey">
  ): Promise<RecordedChange> {
    const id = nanoid();
    const { seq } = this.db
      .insert(schema.changes)
      .values({
        id,
        eventId: change.eventId,
        type: change.type,
        subjectType: change.subjectType,
        subjectId: change.subjectId,
        actorType: change.actor.type,
        actorId:
          change.actor.type === "system" ? null : (change.actor.id ?? null),
        occurredAt: change.occurredAt.toISOString(),
        payload: change.payload,
        audience: meta.audience,
        commandKey: meta.commandKey,
      })
      .returning({ seq: schema.changes.seq })
      .get();
    return { ...change, ...meta, seq, id };
  }

  async getNewestSeq(): Promise<number> {
    const row = this.db.get<{ seq: number }>(
      sql`SELECT seq FROM sqlite_sequence WHERE name = 'changes'`
    );
    return row?.seq ?? 0;
  }

  async getPrunedThrough(): Promise<number> {
    const row = this.db
      .select({ seq: schema.jobCursors.seq })
      .from(schema.jobCursors)
      .where(eq(schema.jobCursors.name, PRUNED_CURSOR))
      .get();
    return row?.seq ?? 0;
  }

  async listAfter(seq: number, limit = 100): Promise<RecordedChange[]> {
    return this.listWhere(gt(schema.changes.seq, seq), limit);
  }

  async listEventAfter(
    eventId: string,
    seq: number,
    limit = 100
  ): Promise<RecordedChange[]> {
    return this.listWhere(
      and(eq(schema.changes.eventId, eventId), gt(schema.changes.seq, seq)),
      limit
    );
  }

  private listWhere(
    where: ReturnType<typeof gt> | undefined,
    limit: number
  ): RecordedChange[] {
    return this.db
      .select()
      .from(schema.changes)
      .where(and(where, inArray(schema.changes.type, KNOWN_TYPES)))
      .orderBy(asc(schema.changes.seq))
      .limit(limit)
      .all()
      .map(toRecordedChange);
  }

  async deleteUpTo(seq: number, before: Date): Promise<void> {
    this.db.transaction(
      (tx) => {
        // Stop at the first change that is too new, so what remains has no
        // gaps and a resume point is either served whole or reset.
        const tooNew = tx
          .select({ seq: min(schema.changes.seq) })
          .from(schema.changes)
          .where(
            and(
              lte(schema.changes.seq, seq),
              gte(schema.changes.occurredAt, before.toISOString())
            )
          )
          .get();
        const through = tooNew?.seq == null ? seq : tooNew.seq - 1;
        tx.delete(schema.changes).where(lte(schema.changes.seq, through)).run();
        tx.insert(schema.jobCursors)
          .values({ name: PRUNED_CURSOR, seq: through })
          .onConflictDoUpdate({
            target: schema.jobCursors.name,
            set: { seq: sql`max(${schema.jobCursors.seq}, ${through})` },
          })
          .run();
      },
      { behavior: "immediate" }
    );
  }
}
