import { and, asc, gt, inArray, lt, lte } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type { ChangesRepository } from "../interfaces";
import type {
  Actor,
  Change,
  RecordedChange,
} from "@schellingboard/domain/change";
import type { Session } from "@schellingboard/domain/session";

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
  };
  switch (row.type) {
    case "session.changed": {
      const payload = row.payload as { before: Session; after: Session };
      return {
        ...common,
        type: "session.changed",
        subjectType: "session",
        payload: {
          before: reviveSession(payload.before),
          after: reviveSession(payload.after),
        },
      };
    }
    case "session.deleted": {
      const payload = row.payload as {
        session: Session;
        rsvpGuestIds: string[];
      };
      return {
        ...common,
        type: "session.deleted",
        subjectType: "session",
        payload: {
          session: reviveSession(payload.session),
          rsvpGuestIds: payload.rsvpGuestIds,
        },
      };
    }
    default:
      throw new Error(`Unknown change type in the log: ${row.type}`);
  }
}

// A reader skips types it does not know, such as rows written by a newer
// version before a rollback, rather than stopping at them.
const KNOWN_TYPES: RecordedChange["type"][] = [
  "session.changed",
  "session.deleted",
];

export class SqliteChangesRepository implements ChangesRepository {
  constructor(private db: DB) {}

  async append(change: Change): Promise<RecordedChange> {
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
      })
      .returning({ seq: schema.changes.seq })
      .get();
    return { ...change, seq, id };
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
