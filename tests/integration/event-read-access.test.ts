import Database from "better-sqlite3";
import fs from "fs";
import os from "os";
import path from "path";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getRepositories } from "@/db/container";
import { runMigrations } from "@/db/migrate";
import { GET, POST, PUT } from "@/tests/helpers/v1-route";

import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { resetTestDb, setupTestDb } from "../helpers/db";
import { createGuest, createProposal } from "../helpers/factories";
import { GUEST_COOKIE_NAME, verifiedGuestValue } from "../helpers/guest-cookie";
import { MIGRATIONS, migrationsBefore } from "../helpers/migrations";

let admin = "";

const call = (
  method: "GET" | "POST" | "PUT",
  url: string,
  { body, cookie = admin }: { body?: unknown; cookie?: string } = {}
) => {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;
  return { GET, POST, PUT }[method](
    new Request(`http://test/api/v1${url}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );
};

const settings = {
  name: "Camp",
  maxSessionDuration: 120,
  breakMinutes: 10,
  slotIncrementMinutes: 30,
};

type Json = Record<string, string | number | boolean | null>;

const make = async (extra: object = {}) => {
  const res = await call("POST", "/admin/events", {
    body: { ...settings, ...extra },
  });
  return { res, event: (await res.json()) as Json };
};

const edit = async (event: Json, extra: object) => {
  const res = await call("PUT", `/admin/events/${event.id}`, {
    body: { ...settings, expectedVersion: event.version, ...extra },
  });
  return { res, body: (await res.json()) as Json };
};

beforeAll(() => setupTestDb());
beforeEach(async () => {
  resetTestDb();
  vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
  vi.stubEnv("SITE_PASSWORD", "");
  const c = await createAdminAuthCookie();
  admin = `${c.name}=${c.value}`;
});
afterEach(() => vi.unstubAllEnvs());

describe("an event's read setting", { tags: ["023-US1"] }, () => {
  it("is public for a new event, with its own link and kiosk tokens", async () => {
    const { event } = await make();
    const other = (await make({ name: "Camp 2" })).event;

    expect(event.readAccess).toBe("public");
    for (const key of ["linkToken", "kioskToken"]) {
      expect(event[key]).toMatch(/^[0-9a-f]{32}$/);
    }
    const tokens = [event, other].flatMap((e) => [e.linkToken, e.kioskToken]);
    expect(new Set(tokens).size).toBe(4);
  });

  it("is shown to everyone, but the tokens only to admins", async () => {
    const { event } = await make();

    const asAdmin = (await (
      await call("GET", `/admin/events/${event.id}`)
    ).json()) as Json;
    const publicOne = (await (
      await call("GET", `/events/${event.id}`, { cookie: "" })
    ).json()) as { event: Json };
    const publicList = (await (
      await call("GET", "/events", { cookie: "" })
    ).json()) as { events: Json[] };

    expect(asAdmin).toMatchObject({
      readAccess: "public",
      linkToken: event.linkToken,
      kioskToken: event.kioskToken,
    });
    expect(publicOne.event.readAccess).toBe("public");
    expect(JSON.stringify([publicOne, publicList])).not.toContain(
      event.linkToken as string
    );
    expect(JSON.stringify([publicOne, publicList])).not.toContain(
      event.kioskToken as string
    );
  });

  it("keeps the tokens from outsiders, members and hosts", async () => {
    const { event } = await make();
    const eventId = event.id as string;
    const member = await createGuest({ eventId });
    const host = await createGuest({ eventId });
    await createProposal(eventId, [host.id]);
    const cookies = [
      "",
      `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(member.id)}`,
      `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(host.id)}`,
    ];

    for (const cookie of cookies) {
      const res = await call("GET", `/admin/events/${eventId}`, { cookie });
      expect(res.status).toBe(403);
    }
  });

  it("is not written to the change log with the tokens", async () => {
    const { event } = await make();
    await edit(event, { readAccess: "link" });

    const logged = await getRepositories().changes.listAfter(0);
    const payload = JSON.stringify(logged.map((c) => c.payload));
    expect(payload).toContain(event.id as string);
    expect(payload).not.toContain(event.linkToken as string);
    expect(payload).not.toContain(event.kioskToken as string);
  });

  it("is link-only for a new event while the site has a password", async () => {
    vi.stubEnv("SITE_PASSWORD", "secret");
    const { event } = await make();
    expect(event.readAccess).toBe("link");

    vi.stubEnv("SITE_PASSWORD", "");
    expect((await make({ name: "Camp 2" })).event.readAccess).toBe("public");
  });

  it("changes with an edit and stays when an edit leaves it out", async () => {
    const { event } = await make({ identityMode: "open" });

    const linked = await edit(event, { readAccess: "link" });
    expect(linked.body).toMatchObject({
      readAccess: "link",
      identityMode: "open",
      linkToken: event.linkToken,
    });

    const again = await edit(linked.body, {});
    expect(again.body.readAccess).toBe("link");
  });

  it.each([
    ["participants", "open", 400],
    ["public", "open", 201],
    ["link", "open", 201],
    ["link", "verified", 201],
    ["participants", "verified", 201],
    ["public", "verified", 201],
  ] as const)(
    "%s with %s identity answers %s on create",
    async (readAccess, identityMode, status) => {
      const { res } = await make({ readAccess, identityMode });
      expect(res.status).toBe(status);
    }
  );

  it("refuses participants-only for an open event, and open for a participants-only one", async () => {
    const { event } = await make({ identityMode: "open" });
    const toParticipants = await edit(event, { readAccess: "participants" });
    expect(toParticipants.res.status).toBe(400);
    expect(toParticipants.body).toMatchObject({
      code: "event.accessPairInvalid",
      errors: [{ path: "readAccess" }],
    });

    const strict = (await make({ name: "Strict", readAccess: "participants" }))
      .event;
    const toOpen = await edit(strict, { identityMode: "open" });
    expect(toOpen.body.code).toBe("event.accessPairInvalid");
    expect(
      (await edit(strict, { identityMode: "open", readAccess: "link" })).res
        .status
    ).toBe(200);
  });

  it("refuses an unknown setting", async () => {
    const { res, event } = await make({ readAccess: "everyone" });
    expect(res.status).toBe(400);
    expect(event.code).toBe("request.invalid");
  });
});

describe("the migration adding read settings", { tags: ["023-US1"] }, () => {
  const ADD_READ_ACCESS_IDX = 68;
  let tempDir: string;

  const migrateOldDb = (sitePassword: boolean) => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sb-read-access-"));
    const db = new Database(path.join(tempDir, "data.db"));
    runMigrations(db, migrationsBefore(ADD_READ_ACCESS_IDX, tempDir));
    for (const id of ["a", "b"]) {
      db.prepare("INSERT INTO events (id, name, slug) VALUES (?, ?, ?)").run(
        id,
        id,
        id
      );
    }
    runMigrations(db, MIGRATIONS, { sitePasswordSet: sitePassword });
    const rows = db
      .prepare("SELECT read_access, link_token, kiosk_token FROM events")
      .all() as {
      read_access: string;
      link_token: string;
      kiosk_token: string;
    }[];
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
    return rows;
  };

  it("makes existing events public, each with its own tokens", () => {
    const rows = migrateOldDb(false);
    expect(rows.map((r) => r.read_access)).toEqual(["public", "public"]);
    const tokens = rows.flatMap((r) => [r.link_token, r.kiosk_token]);
    expect(new Set(tokens).size).toBe(4);
    for (const t of tokens) expect(t).toMatch(/^[0-9a-f]{32}$/);
  });

  it("makes them link-only when the site had a password", () => {
    expect(migrateOldDb(true).map((r) => r.read_access)).toEqual([
      "link",
      "link",
    ]);
  });

  it("still flips the events when an earlier start stopped after migrating", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sb-read-access-"));
    const db = new Database(path.join(tempDir, "data.db"));
    runMigrations(db, migrationsBefore(ADD_READ_ACCESS_IDX, tempDir));
    db.prepare(
      "INSERT INTO events (id, name, slug) VALUES ('a', 'a', 'a')"
    ).run();
    db.pragma("user_version = 1");

    runMigrations(db, MIGRATIONS, { sitePasswordSet: false });

    expect(db.prepare("SELECT read_access FROM events").all()).toEqual([
      { read_access: "link" },
    ]);
    expect(db.pragma("user_version", { simple: true })).toBe(0);
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("leaves the setting alone on later starts", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sb-read-access-"));
    const db = new Database(path.join(tempDir, "data.db"));
    runMigrations(db, MIGRATIONS, { sitePasswordSet: false });
    db.prepare(
      "INSERT INTO events (id, name, slug) VALUES ('a', 'a', 'a')"
    ).run();

    runMigrations(db, MIGRATIONS, { sitePasswordSet: true });

    expect(db.prepare("SELECT read_access FROM events").all()).toEqual([
      { read_access: "public" },
    ]);
    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
