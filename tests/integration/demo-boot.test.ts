import Database from "better-sqlite3";
import fs from "fs";
import os from "os";
import path from "path";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { resetRepositories } from "@/db/container";
import { resolveDbPath } from "@/db/migrate";
import {
  assertResetAt,
  lastReset,
  nextReset,
  prepareDemoDatabase,
} from "@/server/demo/boot";
import { verifiedCurrentUser } from "@/utils/acting-guest";

import { resetTestDb, setupTestDb } from "../helpers/db";
import { openGuestValue } from "../helpers/guest-cookie";

const RESET_AT = "03:00";
const V1 = "1.0.0";
const day = (hhmm: string, date = "2026-03-10") =>
  new Date(`${date}T${hhmm}:00Z`);

let uploads: string;

function query<T>(sql: string): T[] {
  const db = new Database(resolveDbPath());
  try {
    return db.prepare(sql).all() as T[];
  } finally {
    db.close();
  }
}

function exec(sql: string) {
  const db = new Database(resolveDbPath());
  try {
    db.exec(sql);
  } finally {
    db.close();
  }
}

const count = (table: string) =>
  query<{ n: number }>(`SELECT count(*) AS n FROM ${table}`)[0].n;

function boot(now: Date, version = V1) {
  return prepareDemoDatabase({
    now,
    resetAt: RESET_AT,
    version,
    profile: "small",
  });
}

describe("the demo's daily reset", { tags: ["024-US1"] }, () => {
  beforeAll(() => {
    setupTestDb();
    uploads = fs.mkdtempSync(path.join(os.tmpdir(), "demo-uploads-"));
  }, 60_000);

  afterAll(() => {
    fs.rmSync(uploads, { recursive: true, force: true });
  });

  beforeEach(() => {
    resetTestDb();
    vi.stubEnv("SB_UPLOADS_DIR", uploads);
  });

  afterEach(() => vi.unstubAllEnvs());

  it("finds the last and the next scheduled reset", () => {
    expect(lastReset(day("10:00"), RESET_AT)).toEqual(day("03:00"));
    expect(lastReset(day("01:00"), RESET_AT)).toEqual(
      day("03:00", "2026-03-09")
    );
    expect(nextReset(day("10:00"), RESET_AT)).toEqual(
      day("03:00", "2026-03-11")
    );
    expect(nextReset(day("01:00"), RESET_AT)).toEqual(day("03:00"));
  });

  it("seeds an empty database", async () => {
    expect(await boot(day("10:00"))).toBe("seeded");
    expect(count("guests")).toBeGreaterThan(0);
    expect(count("events")).toBeGreaterThan(0);
  });

  it("refuses data that did not come from the demo seed", async () => {
    await boot(day("10:00"));
    exec("DELETE FROM demo_marker");
    await expect(boot(day("11:00"))).rejects.toThrow(/not.*demo/i);
  });

  it("keeps the data when it restarts on the same day", async () => {
    await boot(day("10:00"));
    const before = query<{ id: string }>("SELECT id FROM guests ORDER BY id");

    expect(await boot(day("12:00"))).toBe("kept");
    expect(query("SELECT id FROM guests ORDER BY id")).toEqual(before);
  });

  it("reseeds once a scheduled reset has passed", async () => {
    await boot(day("10:00"));
    const before = query<{ id: string }>("SELECT id FROM guests ORDER BY id");

    expect(await boot(day("03:00", "2026-03-11"))).toBe("reseeded");
    expect(query("SELECT id FROM guests ORDER BY id")).not.toEqual(before);
    expect(count("guests")).toBe(before.length);
  });

  it("reseeds when another version took over", async () => {
    await boot(day("10:00"));
    const before = query<{ id: string }>("SELECT id FROM guests ORDER BY id");

    expect(await boot(day("12:00"), "1.1.0")).toBe("reseeded");
    expect(query("SELECT id FROM guests ORDER BY id")).not.toEqual(before);
  });

  it("drops a guest cookie from before the reset", async () => {
    vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
    await boot(day("10:00"));
    resetRepositories();
    const [{ id }] = query<{ id: string }>(
      "SELECT id FROM guests WHERE auth_protected = 0 LIMIT 1"
    );
    const cookie = openGuestValue(id);
    const jar = { get: () => ({ value: cookie }) };
    expect(await verifiedCurrentUser(jar)).toBe(id);

    await boot(day("03:00", "2026-03-11"));
    resetRepositories();

    expect(await verifiedCurrentUser(jar)).toBeNull();
  });

  it("leaves no visitor content behind", async () => {
    await boot(day("10:00"));
    exec(
      `INSERT INTO changes (id, type, subject_type, subject_id, actor_type, occurred_at, payload)
       VALUES ('visitor-change', 'x', 'y', 'z', 'guest', '2026-03-10T10:00:00Z', '{"text":"hi"}');
       INSERT INTO idempotency_keys (actor, key, method, path, body_hash, created_at)
       VALUES ('a', 'k', 'POST', '/p', 'h', '2026-03-10T10:00:00Z')`
    );
    fs.mkdirSync(path.join(uploads, "locations"), { recursive: true });
    fs.writeFileSync(path.join(uploads, "locations", "x.png"), "x");

    await boot(day("03:00", "2026-03-11"));

    expect(query("SELECT 1 FROM changes WHERE id = 'visitor-change'")).toEqual(
      []
    );
    expect(count("idempotency_keys")).toBe(0);
    expect(fs.existsSync(path.join(uploads, "locations"))).toBe(false);
  });

  it("rejects a reset time that is not a clock time", () => {
    expect(() => assertResetAt("25:99")).toThrow(/SB_DEMO_RESET_AT/);
    expect(() => assertResetAt("03:00")).not.toThrow();
  });
});
