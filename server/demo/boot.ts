import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import { resolveDbPath, runMigrations } from "@/db/migrate";
import { type SeedProfile, seedTestData } from "@/scripts/seed/seed";
import { uploadsDir } from "@/utils/uploads-dir";

export type BootOutcome = "seeded" | "kept" | "reseeded";

const DAY_MS = 24 * 60 * 60 * 1000;

export function assertResetAt(resetAt: string): void {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(resetAt)) {
    throw new Error(`Invalid SB_DEMO_RESET_AT "${resetAt}" (use HH:MM, UTC)`);
  }
}

function resetOn(day: Date, resetAt: string): Date {
  const [hours, minutes] = resetAt.split(":").map(Number);
  return new Date(
    Date.UTC(
      day.getUTCFullYear(),
      day.getUTCMonth(),
      day.getUTCDate(),
      hours,
      minutes
    )
  );
}

export function lastReset(now: Date, resetAt: string): Date {
  const today = resetOn(now, resetAt);
  return today <= now ? today : new Date(today.getTime() - DAY_MS);
}

export function nextReset(now: Date, resetAt: string): Date {
  return new Date(lastReset(now, resetAt).getTime() + DAY_MS);
}

type Marker = { seeded_at: string; version: string };

// Its own table, outside the drizzle schema: only the demo writes it, so the
// product's migrations and code never learn about the demo.
function inspect(): { marker: Marker | undefined; data: boolean } {
  const file = resolveDbPath();
  if (!fs.existsSync(file)) return { marker: undefined, data: false };
  const sqlite = new Database(file, { readonly: true });
  try {
    const tables = new Set(
      (
        sqlite
          .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
          .all() as {
          name: string;
        }[]
      ).map((t) => t.name)
    );
    const marker = tables.has("demo_marker")
      ? (sqlite.prepare("SELECT seeded_at, version FROM demo_marker").get() as
          Marker | undefined)
      : undefined;
    const data = ["guests", "events", "site_settings", "login_sessions"].some(
      (table) =>
        tables.has(table) &&
        sqlite.prepare(`SELECT 1 FROM ${table} LIMIT 1`).get() !== undefined
    );
    return { marker, data };
  } finally {
    sqlite.close();
  }
}

function writeMarker(seededAt: Date, version: string) {
  const sqlite = new Database(resolveDbPath());
  try {
    runMigrations(sqlite, path.resolve(process.cwd(), "drizzle"));
    sqlite.exec(
      `CREATE TABLE IF NOT EXISTS demo_marker (
         id INTEGER PRIMARY KEY CHECK (id = 1),
         seeded_at TEXT NOT NULL,
         version TEXT NOT NULL
       )`
    );
    sqlite
      .prepare(
        `INSERT INTO demo_marker (id, seeded_at, version) VALUES (1, ?, ?)
         ON CONFLICT (id) DO UPDATE SET seeded_at = excluded.seeded_at, version = excluded.version`
      )
      .run(seededAt.toISOString(), version);
  } finally {
    sqlite.close();
  }
}

// Deleting the files, rather than clearing tables, is what guarantees that no
// visitor content (change log, idempotency keys, uploads) survives a reset.
function wipe() {
  const file = resolveDbPath();
  for (const suffix of ["", "-wal", "-shm"]) {
    fs.rmSync(file + suffix, { force: true });
  }
  const uploads = uploadsDir();
  if (fs.existsSync(uploads)) {
    for (const entry of fs.readdirSync(uploads)) {
      fs.rmSync(path.join(uploads, entry), { recursive: true, force: true });
    }
  }
}

export async function prepareDemoDatabase({
  now,
  resetAt,
  version,
  profile,
}: {
  now: Date;
  resetAt: string;
  version: string;
  profile: SeedProfile;
}): Promise<BootOutcome> {
  const { marker, data } = inspect();

  if (!marker && data) {
    throw new Error(
      "Refusing to start: the database holds data that is not from the demo seed."
    );
  }
  if (
    marker &&
    marker.version === version &&
    new Date(marker.seeded_at) >= lastReset(now, resetAt)
  ) {
    return "kept";
  }

  wipe();
  // Marked as stale before seeding, so a seed that dies half-way is reseeded
  // on the next start instead of refused as foreign data.
  writeMarker(new Date(0), version);
  await seedTestData(profile, now);
  writeMarker(now, version);
  return marker ? "reseeded" : "seeded";
}
