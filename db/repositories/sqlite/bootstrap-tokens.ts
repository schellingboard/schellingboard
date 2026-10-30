import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../schema";
import type { BootstrapTokensRepository } from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

export class SqliteBootstrapTokensRepository implements BootstrapTokensRepository {
  constructor(private readonly db: DB) {}

  async replace(token: {
    hash: string;
    createdAt: Date;
    expiresAt: Date;
  }): Promise<void> {
    this.db.transaction((tx) => {
      tx.delete(schema.bootstrapTokens).run();
      tx.insert(schema.bootstrapTokens)
        .values({
          hash: token.hash,
          createdAt: token.createdAt.toISOString(),
          expiresAt: token.expiresAt.toISOString(),
        })
        .run();
    });
  }

  async findLive(hash: string, now: Date): Promise<{ hash: string } | null> {
    const row = this.db
      .select()
      .from(schema.bootstrapTokens)
      .where(eq(schema.bootstrapTokens.hash, hash))
      .get();
    return row && new Date(row.expiresAt) > now ? { hash: row.hash } : null;
  }

  async delete(hash: string): Promise<void> {
    this.db
      .delete(schema.bootstrapTokens)
      .where(eq(schema.bootstrapTokens.hash, hash))
      .run();
  }
}
