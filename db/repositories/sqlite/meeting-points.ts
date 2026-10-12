import { asc, eq, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type { MeetingPointsRepository } from "../interfaces";
import type { MeetingPoint } from "@schellingboard/domain/meeting";

type DB = BetterSQLite3Database<typeof schema>;

function rowToPoint(
  row: typeof schema.meetingPoints.$inferSelect
): MeetingPoint {
  return {
    id: row.id,
    eventId: row.eventId,
    name: row.name,
    description: row.description,
    sortIndex: row.sortIndex,
    version: row.version,
  };
}

export class SqliteMeetingPointsRepository implements MeetingPointsRepository {
  constructor(private readonly db: DB) {}

  async listByEvent(eventId: string): Promise<MeetingPoint[]> {
    return this.db
      .select()
      .from(schema.meetingPoints)
      .where(eq(schema.meetingPoints.eventId, eventId))
      .orderBy(
        asc(schema.meetingPoints.sortIndex),
        asc(schema.meetingPoints.id)
      )
      .all()
      .map(rowToPoint);
  }

  async create(
    data: Omit<MeetingPoint, "id" | "version">
  ): Promise<MeetingPoint> {
    const row = { id: nanoid(), ...data, version: 1 };
    this.db.insert(schema.meetingPoints).values(row).run();
    return rowToPoint(row);
  }

  private findByIdSync(id: string): MeetingPoint | undefined {
    const row = this.db
      .select()
      .from(schema.meetingPoints)
      .where(eq(schema.meetingPoints.id, id))
      .get();
    return row ? rowToPoint(row) : undefined;
  }

  async update(
    id: string,
    {
      expectedVersion,
      ...patch
    }: Partial<Omit<MeetingPoint, "id" | "eventId" | "version">> & {
      expectedVersion?: number;
    }
  ): Promise<MeetingPoint | undefined> {
    const values: Partial<typeof schema.meetingPoints.$inferInsert> = {};
    if (patch.name !== undefined) values.name = patch.name;
    if (patch.description !== undefined) values.description = patch.description;
    if (patch.sortIndex !== undefined) values.sortIndex = patch.sortIndex;
    const applied = this.db.transaction(
      (tx) => {
        const before = this.findByIdSync(id);
        if (
          !before ||
          (expectedVersion !== undefined && before.version !== expectedVersion)
        )
          return false;
        if (Object.keys(values).length === 0) return true;
        tx.update(schema.meetingPoints)
          .set(values)
          .where(eq(schema.meetingPoints.id, id))
          .run();
        if (JSON.stringify(before) !== JSON.stringify(this.findByIdSync(id))) {
          tx.update(schema.meetingPoints)
            .set({ version: sql`${schema.meetingPoints.version} + 1` })
            .where(eq(schema.meetingPoints.id, id))
            .run();
        }
        return true;
      },
      { behavior: "immediate" }
    );
    return applied ? this.findByIdSync(id) : undefined;
  }

  async delete(id: string): Promise<void> {
    this.db
      .delete(schema.meetingPoints)
      .where(eq(schema.meetingPoints.id, id))
      .run();
  }
}
