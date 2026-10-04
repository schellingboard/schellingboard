import { and, asc, eq, inArray, isNull, lt, lte, or, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { nanoid } from "nanoid";
import * as schema from "../../schema";
import type { DeliveriesRepository } from "../interfaces";
import type {
  Delivery,
  DeliveryChannel,
} from "@schellingboard/domain/notification";

type DB = BetterSQLite3Database<typeof schema>;

export class SqliteDeliveriesRepository implements DeliveriesRepository {
  constructor(private db: DB) {}

  async enqueue(delivery: {
    guestId: string;
    channel: DeliveryChannel;
    payload: unknown;
  }): Promise<void> {
    this.db
      .insert(schema.deliveries)
      .values({ id: nanoid(), ...delivery })
      .run();
  }

  async claimDue(
    now: Date,
    limit: number,
    holdMs: number
  ): Promise<Delivery[]> {
    return this.db.transaction(
      (tx) => {
        const rows = tx
          .select()
          .from(schema.deliveries)
          .where(
            and(
              isNull(schema.deliveries.sentAt),
              isNull(schema.deliveries.abandonedAt),
              or(
                isNull(schema.deliveries.nextAttemptAt),
                lte(schema.deliveries.nextAttemptAt, now.toISOString())
              )
            )
          )
          .orderBy(asc(sql`rowid`))
          .limit(limit)
          .all();
        if (rows.length > 0) {
          tx.update(schema.deliveries)
            .set({
              nextAttemptAt: new Date(now.getTime() + holdMs).toISOString(),
            })
            .where(
              inArray(
                schema.deliveries.id,
                rows.map((row) => row.id)
              )
            )
            .run();
        }
        return rows.map((row) => ({
          id: row.id,
          guestId: row.guestId,
          channel: row.channel as DeliveryChannel,
          payload: row.payload,
          attempts: row.attempts,
          firstFailedAt: row.firstFailedAt ? new Date(row.firstFailedAt) : null,
        }));
      },
      { behavior: "immediate" }
    );
  }

  async markSent(id: string, now: Date): Promise<void> {
    this.db
      .update(schema.deliveries)
      .set({ sentAt: now.toISOString(), lastError: null })
      .where(eq(schema.deliveries.id, id))
      .run();
  }

  async markFailed(
    id: string,
    now: Date,
    error: string,
    retryAt: Date | null
  ): Promise<void> {
    this.db
      .update(schema.deliveries)
      .set({
        attempts: sql`${schema.deliveries.attempts} + 1`,
        firstFailedAt: sql`coalesce(${schema.deliveries.firstFailedAt}, ${now.toISOString()})`,
        lastError: error,
        nextAttemptAt: retryAt?.toISOString() ?? null,
        abandonedAt: retryAt ? null : now.toISOString(),
      })
      .where(eq(schema.deliveries.id, id))
      .run();
  }

  async pruneSettled(before: Date): Promise<void> {
    const cutoff = before.toISOString();
    this.db
      .delete(schema.deliveries)
      .where(
        or(
          lt(schema.deliveries.sentAt, cutoff),
          lt(schema.deliveries.abandonedAt, cutoff)
        )
      )
      .run();
  }
}
