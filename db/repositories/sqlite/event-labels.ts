import {
  type EventLabel,
  isLabelColorName,
} from "@schellingboard/domain/event-label";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";

import * as schema from "../../schema";
import type { EventLabelsRepository } from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

export class SqliteEventLabelsRepository implements EventLabelsRepository {
  constructor(private readonly db: DB) {}

  private withGuests(rows: (typeof schema.eventLabels.$inferSelect)[]) {
    const assigned =
      rows.length === 0
        ? []
        : this.db
            .select()
            .from(schema.guestLabels)
            .where(
              inArray(
                schema.guestLabels.eventLabelId,
                rows.map((r) => r.id)
              )
            )
            .all();
    return rows.map((row): EventLabel => ({
      id: row.id,
      eventId: row.eventId,
      name: row.name,
      description: row.description,
      color: isLabelColorName(row.color) ? row.color : "slate",
      guestIds: assigned
        .filter((a) => a.eventLabelId === row.id)
        .map((a) => a.guestId)
        .sort(),
    }));
  }

  async listByEvent(eventId: string): Promise<EventLabel[]> {
    return this.withGuests(
      this.db
        .select()
        .from(schema.eventLabels)
        .where(eq(schema.eventLabels.eventId, eventId))
        .orderBy(asc(schema.eventLabels.position), asc(schema.eventLabels.id))
        .all()
    );
  }

  async findById(id: string): Promise<EventLabel | undefined> {
    return this.withGuests(
      this.db
        .select()
        .from(schema.eventLabels)
        .where(eq(schema.eventLabels.id, id))
        .all()
    )[0];
  }

  async create(
    data: Pick<EventLabel, "eventId" | "name" | "description" | "color">
  ): Promise<EventLabel> {
    const id = nanoid();
    const last = this.db
      .select({
        max: sql<number | null>`max(${schema.eventLabels.position})`,
      })
      .from(schema.eventLabels)
      .where(eq(schema.eventLabels.eventId, data.eventId))
      .get();
    this.db
      .insert(schema.eventLabels)
      .values({ id, ...data, position: (last?.max ?? -1) + 1 })
      .run();
    return { id, ...data, guestIds: [] };
  }

  async update(
    id: string,
    patch: Pick<EventLabel, "name" | "description" | "color">
  ): Promise<EventLabel | undefined> {
    this.db
      .update(schema.eventLabels)
      .set(patch)
      .where(eq(schema.eventLabels.id, id))
      .run();
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    this.db
      .delete(schema.eventLabels)
      .where(eq(schema.eventLabels.id, id))
      .run();
  }

  async setGuestLabels(
    eventId: string,
    guestId: string,
    labelIds: string[]
  ): Promise<void> {
    this.db.transaction((tx) => {
      const ofEvent = tx
        .select({ id: schema.eventLabels.id })
        .from(schema.eventLabels)
        .where(eq(schema.eventLabels.eventId, eventId))
        .all()
        .map((r) => r.id);
      if (ofEvent.length > 0)
        tx.delete(schema.guestLabels)
          .where(
            and(
              eq(schema.guestLabels.guestId, guestId),
              inArray(schema.guestLabels.eventLabelId, ofEvent)
            )
          )
          .run();
      if (labelIds.length > 0)
        tx.insert(schema.guestLabels)
          .values(labelIds.map((eventLabelId) => ({ eventLabelId, guestId })))
          .run();
    });
  }
}
