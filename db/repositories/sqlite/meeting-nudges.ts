import { and, eq, isNull } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../schema";
import type { MeetingNudgesRepository } from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

export class SqliteMeetingNudgesRepository implements MeetingNudgesRepository {
  constructor(private readonly db: DB) {}

  async create(data: {
    eventId: string;
    askerId: string;
    recipientId: string;
    createdAt: Date;
  }): Promise<boolean> {
    const inserted = this.db
      .insert(schema.meetingNudges)
      .values({ ...data, createdAt: data.createdAt.toISOString() })
      .onConflictDoNothing()
      .returning()
      .all();
    return inserted.length > 0;
  }

  async listEventsAsked(
    askerId: string,
    recipientId: string
  ): Promise<string[]> {
    return this.db
      .select({ eventId: schema.meetingNudges.eventId })
      .from(schema.meetingNudges)
      .where(
        and(
          eq(schema.meetingNudges.askerId, askerId),
          eq(schema.meetingNudges.recipientId, recipientId)
        )
      )
      .all()
      .map((row) => row.eventId);
  }

  async answerOpen(
    eventId: string,
    recipientId: string,
    answeredAt: Date
  ): Promise<string[]> {
    return this.db
      .update(schema.meetingNudges)
      .set({ answeredAt: answeredAt.toISOString() })
      .where(
        and(
          eq(schema.meetingNudges.eventId, eventId),
          eq(schema.meetingNudges.recipientId, recipientId),
          isNull(schema.meetingNudges.answeredAt)
        )
      )
      .returning({ askerId: schema.meetingNudges.askerId })
      .all()
      .map((row) => row.askerId);
  }
}
