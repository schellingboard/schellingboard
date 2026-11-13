import type Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const DEFAULT_DB_URL = "file:./data.db";

/** Resolves the on-disk path for the SQLite database from DATABASE_URL. */
export function resolveDbPath(
  url: string = process.env.DATABASE_URL ?? DEFAULT_DB_URL
): string {
  return url.replace(/^file:/, "");
}

/** `PRAGMA user_version` while migration 0068 awaits its site-password flip. */
const READ_ACCESS_FLIP_PENDING = 1;

/** Undefined on a new database, where there are no events to carry over. */
function hasReadAccessColumn(sqlite: Database.Database): boolean | undefined {
  const columns = sqlite.pragma("table_info(events)") as { name: string }[];
  if (columns.length === 0) return undefined;
  return columns.some((c) => c.name === "read_access");
}

/**
 * Runs Drizzle migrations with foreign-key enforcement disabled.
 *
 * SQLite only allows toggling `foreign_keys` while no transaction is open, and
 * Drizzle wraps each migration in a transaction — so the `PRAGMA foreign_keys`
 * statements emitted inside the migration files are silently ignored. Table
 * rebuilds (DROP + recreate), which Drizzle generates for many column changes,
 * therefore fail against a populated database. Disabling enforcement here,
 * outside any transaction, is SQLite's recommended workaround.
 * See https://github.com/drizzle-team/drizzle-orm/issues/4089
 *
 * Because enforcement is off, a faulty migration could introduce a dangling
 * reference unnoticed, so afterwards we run `PRAGMA foreign_key_check` and
 * throw if any violation slipped through (it cannot be rolled back at that
 * point, but failing loudly surfaces the bad migration in dev/CI).
 */
export function runMigrations(
  sqlite: Database.Database,
  migrationsFolder: string,
  { sitePasswordSet = Boolean(process.env.SITE_PASSWORD) } = {}
): void {
  try {
    sqlite.pragma("foreign_keys = OFF");
    // SQL cannot read the environment: events of an instance behind a site
    // password become link-only on the run that introduces the setting. The
    // marker is written before migrating so that a stop in between still
    // flips them on the next start.
    if (sitePasswordSet && hasReadAccessColumn(sqlite) === false) {
      sqlite.pragma(`user_version = ${READ_ACCESS_FLIP_PENDING}`);
    }
    migrate(drizzle(sqlite), { migrationsFolder });
    if (
      sqlite.pragma("user_version", { simple: true }) ===
      READ_ACCESS_FLIP_PENDING
    ) {
      sqlite.transaction(() => {
        sqlite.prepare("UPDATE events SET read_access = 'link'").run();
        sqlite.pragma("user_version = 0");
      })();
    }
    const violations = sqlite.pragma("foreign_key_check") as unknown[];
    if (violations.length > 0) {
      throw new Error(
        `Migration produced ${violations.length} foreign key violation(s): ` +
          JSON.stringify(violations)
      );
    }
  } finally {
    sqlite.pragma("foreign_keys = ON");
  }
}
