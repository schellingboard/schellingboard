import { and, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../schema";
import type { SessionMarksRepository } from "../interfaces";
import type { SessionMark } from "@schellingboard/domain/session";

type DB = BetterSQLite3Database<typeof schema>;

export class SqliteSessionMarksRepository implements SessionMarksRepository {
  constructor(private readonly db: DB) {}

  async listByGuest(guestId: string): Promise<SessionMark[]> {
    return this.db
      .select({
        sessionId: schema.sessionMarks.sessionId,
        guestId: schema.sessionMarks.guestId,
        kind: schema.sessionMarks.kind,
      })
      .from(schema.sessionMarks)
      .where(eq(schema.sessionMarks.guestId, guestId))
      .all();
  }

  async upsert(mark: SessionMark, now: Date): Promise<void> {
    this.db
      .insert(schema.sessionMarks)
      .values({ ...mark, createdAt: now.toISOString() })
      .onConflictDoUpdate({
        target: [schema.sessionMarks.guestId, schema.sessionMarks.sessionId],
        set: { kind: mark.kind, createdAt: now.toISOString() },
      })
      .run();
  }

  async delete(sessionId: string, guestId: string): Promise<boolean> {
    return (
      this.db
        .delete(schema.sessionMarks)
        .where(
          and(
            eq(schema.sessionMarks.sessionId, sessionId),
            eq(schema.sessionMarks.guestId, guestId)
          )
        )
        .run().changes > 0
    );
  }
}
