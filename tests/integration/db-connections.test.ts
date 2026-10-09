// @module-tag 019-US7
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent } from "../helpers/factories";
import type Database from "better-sqlite3";
import { getRepositories, withWriter } from "@/db/container";

function insertEvent(writer: Database.Database, slug: string) {
  writer
    .prepare("INSERT INTO events (id, name, slug) VALUES (?, ?, ?)")
    .run(slug, slug, slug);
}

describe("database connections", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  it("never shows a read the rows of an uncommitted write", async () => {
    const seen = await withWriter(async (writer) => {
      writer.exec("BEGIN IMMEDIATE");
      try {
        insertEvent(writer, "uncommitted");
        return await getRepositories().events.findBySlug("uncommitted");
      } finally {
        writer.exec("ROLLBACK");
      }
    });

    expect(seen).toBeUndefined();
  });

  it("runs a repository write after an open write, not inside it", async () => {
    let begun!: () => void;
    const started = new Promise<void>((resolve) => (begun = resolve));
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    const open = withWriter(async (writer) => {
      writer.exec("BEGIN IMMEDIATE");
      insertEvent(writer, "rolled-back");
      begun();
      await held;
      writer.exec("ROLLBACK");
    });
    await started;
    const created = createEvent({ name: "Committed" });
    release();
    await open;
    const event = await created;

    const { events } = getRepositories();
    expect(await events.findById(event.id)).toBeDefined();
    expect(await events.findBySlug("rolled-back")).toBeUndefined();
  });
});
