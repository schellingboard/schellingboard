import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { getRepositories } from "@/db/container";

const T0 = new Date("2026-06-01T10:00:00.000Z");
const later = (ms: number) => new Date(T0.getTime() + ms);

describe("jobs lease", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  it("lets one process hold the loop until the lease runs out", async () => {
    const { jobs } = getRepositories();

    expect(await jobs.acquireLease("jobs", "a", T0, 30_000)).toBe(true);
    expect(await jobs.acquireLease("jobs", "b", later(10_000), 30_000)).toBe(
      false
    );
    expect(await jobs.acquireLease("jobs", "b", later(30_000), 30_000)).toBe(
      true
    );
  });

  it("renews the holder's own lease", async () => {
    const { jobs } = getRepositories();

    await jobs.acquireLease("jobs", "a", T0, 30_000);
    expect(await jobs.acquireLease("jobs", "a", later(20_000), 30_000)).toBe(
      true
    );
    // Renewed at +20s, so still held at +40s.
    expect(await jobs.acquireLease("jobs", "b", later(40_000), 30_000)).toBe(
      false
    );
  });
});
