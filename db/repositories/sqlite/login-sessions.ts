import { and, eq, lt, ne } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { LoginSession } from "@schellingboard/domain/auth";
import * as schema from "../../schema";
import type { LoginSessionsRepository } from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

const TOUCH_AFTER_MS = 60 * 60 * 1000;

function toSession(row: typeof schema.loginSessions.$inferSelect) {
  return {
    id: row.id,
    guestId: row.guestId,
    eventId: row.eventId,
    assurance: row.assurance,
    createdAt: new Date(row.createdAt),
    expiresAt: new Date(row.expiresAt),
    lastSeenAt: new Date(row.lastSeenAt),
    device: row.device,
  } satisfies LoginSession;
}

export class SqliteLoginSessionsRepository implements LoginSessionsRepository {
  constructor(private readonly db: DB) {}

  async create(session: LoginSession): Promise<void> {
    this.db
      .insert(schema.loginSessions)
      .values({
        ...session,
        createdAt: session.createdAt.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
        lastSeenAt: session.lastSeenAt.toISOString(),
      })
      .run();
  }

  async get(id: string): Promise<LoginSession | null> {
    const row = this.db
      .select()
      .from(schema.loginSessions)
      .where(eq(schema.loginSessions.id, id))
      .get();
    return row ? toSession(row) : null;
  }

  async findLive(id: string, now: Date): Promise<LoginSession | null> {
    const session = await this.get(id);
    if (!session || session.expiresAt <= now) return null;
    if (now.getTime() - session.lastSeenAt.getTime() < TOUCH_AFTER_MS)
      return session;
    this.db
      .update(schema.loginSessions)
      .set({ lastSeenAt: now.toISOString() })
      .where(eq(schema.loginSessions.id, id))
      .run();
    return { ...session, lastSeenAt: now };
  }

  async delete(id: string): Promise<void> {
    this.db
      .delete(schema.loginSessions)
      .where(eq(schema.loginSessions.id, id))
      .run();
  }

  async deleteForGuest(guestId: string, exceptId?: string): Promise<void> {
    this.db
      .delete(schema.loginSessions)
      .where(
        and(
          eq(schema.loginSessions.guestId, guestId),
          exceptId ? ne(schema.loginSessions.id, exceptId) : undefined
        )
      )
      .run();
  }

  async deleteVerifiedForGuest(guestId: string): Promise<void> {
    this.db
      .delete(schema.loginSessions)
      .where(
        and(
          eq(schema.loginSessions.guestId, guestId),
          eq(schema.loginSessions.assurance, "verified")
        )
      )
      .run();
  }

  async deleteExpired(now: Date): Promise<void> {
    this.db
      .delete(schema.loginSessions)
      .where(lt(schema.loginSessions.expiresAt, now.toISOString()))
      .run();
  }
}
