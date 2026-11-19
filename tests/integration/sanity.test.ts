import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { getRepositories } from "@/db/container";

import { resetTestDb, setupTestDb } from "../helpers/db";
import { createEvent } from "../helpers/factories";

describe("integration sanity", () => {
  beforeAll(() => {
    setupTestDb();
  });

  beforeEach(() => {
    resetTestDb();
  });

  it("creates and reads back an event", async () => {
    const event = await createEvent({ phase: "proposal" });
    const { events } = getRepositories();
    const found = await events.findById(event.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe(event.name);
  });
});
