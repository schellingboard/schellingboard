import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../schema";
import type { JobsRepository } from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

export class SqliteJobsRepository implements JobsRepository {
  constructor(private db: DB) {}

  async acquireLease(
    name: string,
    owner: string,
    now: Date,
    ttlMs: number
  ): Promise<boolean> {
    return this.db.transaction(
      (tx) => {
        const held = tx
          .select()
          .from(schema.jobLeases)
          .where(eq(schema.jobLeases.name, name))
          .get();
        if (held && held.owner !== owner && new Date(held.expiresAt) > now) {
          return false;
        }
        const expiresAt = new Date(now.getTime() + ttlMs).toISOString();
        tx.insert(schema.jobLeases)
          .values({ name, owner, expiresAt })
          .onConflictDoUpdate({
            target: schema.jobLeases.name,
            set: { owner, expiresAt },
          })
          .run();
        return true;
      },
      { behavior: "immediate" }
    );
  }
}
