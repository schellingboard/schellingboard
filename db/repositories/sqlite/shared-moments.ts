import { asc, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type { SharedMomentsRepository } from "../interfaces";
import type { SharedMoment } from "@schellingboard/domain/event";

type DB = BetterSQLite3Database<typeof schema>;

function rowToMoment(
  row: typeof schema.sharedMoments.$inferSelect
): SharedMoment {
  return {
    id: row.id,
    dayId: row.dayId,
    title: row.title,
    description: row.description,
    start: new Date(row.start),
    end: new Date(row.end),
  };
}

export class SqliteSharedMomentsRepository implements SharedMomentsRepository {
  constructor(private readonly db: DB) {}

  async listByEvent(eventId: string): Promise<SharedMoment[]> {
    return this.db
      .select({ moment: schema.sharedMoments })
      .from(schema.sharedMoments)
      .innerJoin(schema.days, eq(schema.days.id, schema.sharedMoments.dayId))
      .where(eq(schema.days.eventId, eventId))
      .orderBy(asc(schema.sharedMoments.start), asc(schema.sharedMoments.id))
      .all()
      .map((r) => rowToMoment(r.moment));
  }

  async findById(id: string): Promise<SharedMoment | undefined> {
    const row = this.db
      .select()
      .from(schema.sharedMoments)
      .where(eq(schema.sharedMoments.id, id))
      .get();
    return row ? rowToMoment(row) : undefined;
  }

  async createMany(data: Omit<SharedMoment, "id">[]): Promise<SharedMoment[]> {
    return data.map((moment) => {
      const id = nanoid();
      this.db
        .insert(schema.sharedMoments)
        .values({
          id,
          dayId: moment.dayId,
          title: moment.title,
          description: moment.description,
          start: moment.start.toISOString(),
          end: moment.end.toISOString(),
        })
        .run();
      return { id, ...moment };
    });
  }

  async update(
    id: string,
    patch: Partial<Omit<SharedMoment, "id" | "dayId">>
  ): Promise<SharedMoment | undefined> {
    const set: Partial<typeof schema.sharedMoments.$inferInsert> = {};
    if (patch.title !== undefined) set.title = patch.title;
    if (patch.description !== undefined) set.description = patch.description;
    if (patch.start !== undefined) set.start = patch.start.toISOString();
    if (patch.end !== undefined) set.end = patch.end.toISOString();
    if (Object.keys(set).length > 0)
      this.db
        .update(schema.sharedMoments)
        .set(set)
        .where(eq(schema.sharedMoments.id, id))
        .run();
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    this.db
      .delete(schema.sharedMoments)
      .where(eq(schema.sharedMoments.id, id))
      .run();
  }
}
