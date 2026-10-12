import { and, asc, gt, inArray, lt, lte, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type { ChangesRepository } from "../interfaces";
import type {
  Actor,
  Audience,
  Change,
  RecordedChange,
} from "@schellingboard/domain/change";
import type { Day, Event } from "@schellingboard/domain/event";
import type {
  Location,
  LocationUnavailability,
} from "@schellingboard/domain/location";
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

function actorOf(row: ChangeRow): Actor {
  if (row.actorType === "guest" && row.actorId) {
    return { type: "guest", id: row.actorId };
  }
  return row.actorType === "admin" ? { type: "admin" } : { type: "system" };
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
      };
      return {
        ...common,
        type: "session.changed",
        subjectType: "session",
        payload: {
          before: reviveSession(payload.before),
          after: reviveSession(payload.after),
          ...(payload.cascade && { cascade: true as const }),
        },
      };
    }
    case "session.deleted": {
      const payload = row.payload as {
        session: Session;
        rsvpGuestIds: string[];
        cascade?: true;
      };
      return {
        ...common,
        type: "session.deleted",
        subjectType: "session",
        payload: {
          session: reviveSession(payload.session),
          rsvpGuestIds: payload.rsvpGuestIds,
          ...(payload.cascade && { cascade: true as const }),
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
    case "rsvp.removed":
      return {
        ...common,
        type: "rsvp.removed",
        subjectType: "rsvp",
        payload: row.payload as { sessionId: string; guestId: string },
      };
    default:
      throw new Error(`Unknown change type in the log: ${row.type}`);
  }
}

// A reader skips types it does not know, such as rows written by a newer
// version before a rollback, rather than stopping at them.
const KNOWN_TYPES: RecordedChange["type"][] = [
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
];

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
        actorId: change.actor.type === "guest" ? change.actor.id : null,
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

  async listAfter(seq: number, limit = 100): Promise<RecordedChange[]> {
    return this.db
      .select()
      .from(schema.changes)
      .where(
        and(
          gt(schema.changes.seq, seq),
          inArray(schema.changes.type, KNOWN_TYPES)
        )
      )
      .orderBy(asc(schema.changes.seq))
      .limit(limit)
      .all()
      .map(toRecordedChange);
  }

  async deleteUpTo(seq: number, before: Date): Promise<void> {
    this.db
      .delete(schema.changes)
      .where(
        and(
          lte(schema.changes.seq, seq),
          lt(schema.changes.occurredAt, before.toISOString())
        )
      )
      .run();
  }
}
