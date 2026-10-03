// @module-tag 017-US3
import fs from "fs";
import os from "os";
import path from "path";

import Database from "better-sqlite3";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { runMigrations } from "@/db/migrate";
import { MIGRATIONS, migrationsBefore } from "../helpers/migrations";

// The Hidden flag kept a location off the grid and out of booking. Unassigning
// it does the same, so an upgrade changes nothing attendees see.

const DROP_HIDDEN_IDX = 38;

let tempDir: string;
let db: Database.Database;

function addLocation(id: string, hidden: boolean): void {
  db.prepare(
    "INSERT INTO locations (id, name, hidden, bookable) VALUES (?, ?, ?, 1)"
  ).run(id, id, hidden ? 1 : 0);
  db.prepare(
    "INSERT INTO event_locations (event_id, location_id) VALUES ('conf', ?)"
  ).run(id);
}

function eventIds(locationId: string): string[] {
  return (
    db
      .prepare("SELECT event_id FROM event_locations WHERE location_id = ?")
      .all(locationId) as { event_id: string }[]
  ).map((r) => r.event_id);
}

describe("the migration dropping hidden locations", () => {
  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sb-drop-hidden-"));
    db = new Database(path.join(tempDir, "data.db"));
    runMigrations(db, migrationsBefore(DROP_HIDDEN_IDX, tempDir));

    db.prepare(
      "INSERT INTO events (id, name, slug) VALUES ('conf', 'conf', 'conf')"
    ).run();
    addLocation("hidden-room", true);
    addLocation("open-room", false);
    db.prepare(
      "INSERT INTO sessions (id, title, event_id) VALUES ('talk', 'talk', 'conf')"
    ).run();
    db.prepare(
      "INSERT INTO session_locations (session_id, location_id) VALUES ('talk', 'hidden-room')"
    ).run();

    runMigrations(db, MIGRATIONS);
  });

  afterAll(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("unassigns a hidden location from its events", () => {
    expect(eventIds("hidden-room")).toEqual([]);
  });

  it("leaves visible locations assigned", () => {
    expect(eventIds("open-room")).toEqual(["conf"]);
  });

  it("keeps sessions in a formerly hidden location", () => {
    expect(
      db
        .prepare(
          "SELECT location_id FROM session_locations WHERE session_id = 'talk'"
        )
        .all()
    ).toEqual([{ location_id: "hidden-room" }]);
  });

  it("drops the hidden column", () => {
    const columns = db.prepare("PRAGMA table_info(locations)").all() as {
      name: string;
    }[];
    expect(columns.map((c) => c.name)).not.toContain("hidden");
  });
});
