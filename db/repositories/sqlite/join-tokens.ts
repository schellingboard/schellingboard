import { and, eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../schema";
import type { JoinToken, JoinTokensRepository } from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

export class SqliteJoinTokensRepository implements JoinTokensRepository {
  constructor(private readonly db: DB) {}

  async replace(token: JoinToken): Promise<void> {
    this.db.transaction((tx) => {
      tx.delete(schema.joinTokens)
        .where(
          and(
            eq(schema.joinTokens.guestId, token.guestId),
            eq(schema.joinTokens.eventId, token.eventId)
          )
        )
        .run();
      tx.insert(schema.joinTokens)
        .values({ ...token, createdAt: token.createdAt.toISOString() })
        .run();
    });
  }

  async findByHash(hash: string): Promise<JoinToken | null> {
    const row = this.db
      .select()
      .from(schema.joinTokens)
      .where(eq(schema.joinTokens.hash, hash))
      .get();
    return row ? { ...row, createdAt: new Date(row.createdAt) } : null;
  }
}
