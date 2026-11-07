// @module-tag 016-US1
import fs from "fs";
import os from "os";
import path from "path";

import Database from "better-sqlite3";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { runMigrations } from "@/db/migrate";
import { MIGRATIONS, migrationsBefore } from "../helpers/migrations";

const EMAIL_OPTIONAL_IDX = 58;

let tempDir: string;
let db: Database.Database;

describe("the optional-email migration", () => {
  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sb-email-optional-"));
    db = new Database(path.join(tempDir, "data.db"));
    runMigrations(db, migrationsBefore(EMAIL_OPTIONAL_IDX, tempDir));
    db.prepare(
      "INSERT INTO guests (id, name, email) VALUES ('g1', 'One', ''), ('g2', 'Two', '  '), ('g3', 'Three', 'three@test.example')"
    ).run();
    runMigrations(db, MIGRATIONS);
  });

  afterAll(() => {
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("turns a blank email into none and keeps a real one", () => {
    const rows = db
      .prepare("SELECT id, email FROM guests ORDER BY id")
      .all() as { id: string; email: string | null }[];
    expect(rows).toEqual([
      { id: "g1", email: null },
      { id: "g2", email: null },
      { id: "g3", email: "three@test.example" },
    ]);
  });
});
