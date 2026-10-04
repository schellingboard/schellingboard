import { and, eq, lt } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "../../schema";
import type {
  IdempotencyClaim,
  IdempotencyOwner,
  IdempotencyRepository,
  IdempotencyRequest,
  StoredResponse,
} from "../interfaces";

type DB = BetterSQLite3Database<typeof schema>;

const t = schema.idempotencyKeys;

function owned({ actor, key, claimedAt }: IdempotencyOwner) {
  return and(
    eq(t.actor, actor),
    eq(t.key, key),
    eq(t.createdAt, claimedAt.toISOString())
  );
}

export class SqliteIdempotencyRepository implements IdempotencyRepository {
  constructor(private db: DB) {}

  async claim(
    request: IdempotencyRequest,
    now: Date,
    {
      expiredBefore,
      abandonedBefore,
    }: { expiredBefore: Date; abandonedBefore: Date }
  ): Promise<IdempotencyClaim> {
    // Immediate, so two processes on one file cannot both claim the key.
    return this.db.transaction(
      (tx): IdempotencyClaim => {
        const row = tx
          .select()
          .from(t)
          .where(and(eq(t.actor, request.actor), eq(t.key, request.key)))
          .get();
        const createdAt = row && new Date(row.createdAt);
        const live =
          createdAt &&
          createdAt > (row.status === null ? abandonedBefore : expiredBefore);
        if (live) {
          if (
            row.method !== request.method ||
            row.path !== request.path ||
            row.bodyHash !== request.bodyHash
          ) {
            return { state: "keyReused" };
          }
          if (row.status === null) return { state: "inProgress" };
          return {
            state: "done",
            response: {
              status: row.status,
              headers: row.headers ?? {},
              body: row.body,
            },
          };
        }
        const values = {
          ...request,
          status: null,
          headers: null,
          body: null,
          createdAt: now.toISOString(),
        };
        tx.insert(t)
          .values(values)
          .onConflictDoUpdate({ target: [t.actor, t.key], set: values })
          .run();
        return { state: "claimed" };
      },
      { behavior: "immediate" }
    );
  }

  async complete(
    owner: IdempotencyOwner,
    response: StoredResponse
  ): Promise<void> {
    this.db.update(t).set(response).where(owned(owner)).run();
  }

  async release(owner: IdempotencyOwner): Promise<void> {
    this.db.delete(t).where(owned(owner)).run();
  }

  async prune(before: Date): Promise<void> {
    this.db.delete(t).where(lt(t.createdAt, before.toISOString())).run();
  }
}
