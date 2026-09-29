import fs from "fs";
import os from "os";
import path from "path";

import Database from "better-sqlite3";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { runMigrations } from "@/db/migrate";
import { MIGRATIONS, migrationsBefore } from "../helpers/migrations";

// Sessions used to be stored from their slot's start, and every screen added
// the event's break to it. The migration stores the start attendees saw, so
// nothing on screen moves when a release upgrades.

const REAL_START_IDX = 36;

let tempDir: string;
let db: Database.Database;

function addEvent(id: string, breakMinutes: number): void {
  db.prepare(
    "INSERT INTO events (id, name, slug, start, end, break_minutes) VALUES (?, ?, ?, '2026-10-01T00:00:00.000Z', '2026-10-03T00:00:00.000Z', ?)"
  ).run(id, id, id, breakMinutes);
}

function addSession(
  id: string,
  eventId: string,
  opts: { start?: string; end?: string; blocker?: boolean }
): void {
  db.prepare(
    "INSERT INTO sessions (id, title, event_id, start_time, end_time, blocker) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    id,
    id,
    eventId,
    opts.start ?? null,
    opts.end ?? null,
    opts.blocker ? 1 : 0
  );
}

function times(id: string): { start_time: string; end_time: string } {
  return db
    .prepare("SELECT start_time, end_time FROM sessions WHERE id = ?")
    .get(id) as { start_time: string; end_time: string };
}

describe("the migration to stored session starts", () => {
  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sb-real-start-"));
    db = new Database(path.join(tempDir, "data.db"));
    runMigrations(db, migrationsBefore(REAL_START_IDX, tempDir));

    addEvent("fifteen", 15);
    addEvent("none", 0);
    addSession("talk", "fifteen", {
      start: "2026-10-01T09:00:00.000Z",
      end: "2026-10-01T10:00:00.000Z",
    });
    addSession("lunch", "fifteen", {
      start: "2026-10-01T12:00:00.000Z",
      end: "2026-10-01T13:00:00.000Z",
      blocker: true,
    });
    addSession("unscheduled", "fifteen", {});
    addSession("no-break", "none", {
      start: "2026-10-01T09:00:00.000Z",
      end: "2026-10-01T10:00:00.000Z",
    });

    runMigrations(db, MIGRATIONS);
  });

  afterAll(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("starts a session after its event's break, keeping its end", () => {
    expect(times("talk")).toEqual({
      start_time: "2026-10-01T09:15:00.000Z",
      end_time: "2026-10-01T10:00:00.000Z",
    });
  });

  it("leaves a blocker filling its slot", () => {
    expect(times("lunch").start_time).toBe("2026-10-01T12:00:00.000Z");
  });

  it("leaves unscheduled sessions and breakless events alone", () => {
    expect(times("unscheduled").start_time).toBeNull();
    expect(times("no-break").start_time).toBe("2026-10-01T09:00:00.000Z");
  });
});
