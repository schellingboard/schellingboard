import { unzipSync, strFromU8 } from "fflate";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { VoteChoice } from "@schellingboard/domain/vote";
import { getRepositories } from "@/db/container";
import { GUEST_COOKIE_NAME, verifiedGuestValue } from "../helpers/guest-cookie";
import { GET } from "@/tests/helpers/v1-route";
import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { resetTestDb, setupTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createLocation,
  createProposal,
  createSession,
} from "../helpers/factories";

type Stats = {
  tables: StatsTable[];
  filterSummary: string;
  filterOptions: {
    locations: { id: string; name: string }[];
    hosts: { id: string; name: string }[];
  };
};

let admin = "";
let eventId = "";
let ids: Record<string, string> = {};
let hostNames: string[] = [];
let nonHostNames: string[] = [];

function get(path: string, cookie = admin) {
  return GET(new Request(`http://test/api/v1${path}`, { headers: { cookie } }));
}

async function stats(query = "") {
  const res = await get(`/admin/events/${eventId}/stats${query}`);
  expect(res.status).toBe(200);
  return (await res.json()) as Stats;
}

const cell = (stats: Stats, table: string, label: string) =>
  stats.tables
    .find((t) => t.id === table)
    ?.rows.find((r) => r[0] === label)?.[1];

async function build() {
  const { votes, rsvps, sessions } = getRepositories();
  const event = await createEvent({ phase: "scheduling" });
  eventId = event.id;
  const member = (name: string) => createGuest({ name, eventId });
  const a = await member("Ada Host");
  const b = await member("Bob Host");
  const c = await member("Cleo Attendee");
  const d = await member("Dan Attendee");
  const v = await member("Vera Volunteer");
  const room = await createLocation({ eventId, name: "Main Hall" });
  const vol = await createLocation({ eventId, name: "Volunteers 1" });
  const p1 = await createProposal(eventId, [a.id]);
  const p2 = await createProposal(eventId, [b.id]);
  await votes.upsert({
    proposalId: p1.id,
    guestId: b.id,
    choice: VoteChoice.interested,
  });
  await votes.upsert({
    proposalId: p1.id,
    guestId: c.id,
    choice: VoteChoice.maybe,
  });
  await votes.upsert({
    proposalId: p2.id,
    guestId: a.id,
    choice: VoteChoice.skip,
  });
  const s1 = await createSession(eventId, {
    hostIds: [a.id],
    locationIds: [room.id],
    adminManaged: false,
  });
  await sessions.update(s1.id, { proposalId: p1.id });
  await sessions.setAttendeeCount(s1.id, 20);
  const s2 = await createSession(eventId, {
    hostIds: [b.id],
    locationIds: [room.id],
  });
  const s3 = await createSession(eventId, {
    hostIds: [v.id],
    locationIds: [vol.id],
    adminManaged: true,
  });
  await createSession(eventId, { locationIds: [room.id], blocker: true });
  await rsvps.create({ sessionId: s1.id, guestId: b.id });
  await rsvps.create({ sessionId: s1.id, guestId: c.id });
  await rsvps.create({ sessionId: s2.id, guestId: c.id });
  await rsvps.create({ sessionId: s3.id, guestId: d.id });
  ids = { a: a.id, vol: vol.id, v: v.id, c: c.id, d: d.id, s1: s1.id };
  hostNames = ["Ada Host", "Bob Host", "Vera Volunteer"];
  nonHostNames = ["Cleo Attendee", "Dan Attendee"];
}

beforeAll(() => {
  setupTestDb();
});
beforeEach(async () => {
  resetTestDb();
  const c = await createAdminAuthCookie();
  admin = `${c.name}=${c.value}`;
  await build();
});

describe("event statistics", { tags: ["021-US1"] }, () => {
  it("shows the headline numbers, blockers excluded by default", async () => {
    const s = await stats();
    expect(cell(s, "overview-headline", "Members")).toBe(5);
    expect(cell(s, "overview-headline", "Active members")).toBe(5);
    expect(cell(s, "overview-headline", "Voters")).toBe(3);
    expect(cell(s, "overview-headline", "People with RSVPs")).toBe(3);
    expect(cell(s, "overview-headline", "Proposals")).toBe(2);
    expect(cell(s, "overview-headline", "Sessions")).toBe(3);
    expect(cell(s, "overview-headline", "Hosts")).toBe(3);
    expect(
      cell(s, "overview-headline", "Sessions with an attendee report")
    ).toBe(1);
    expect(s.filterSummary).toBe("Excluding blockers");
  });

  it("shows the participation funnel with shares of the members", async () => {
    const funnel = (await stats()).tables.find(
      (t) => t.id === "overview-funnel"
    );
    expect(funnel?.rows).toEqual([
      ["Members", 5, 100],
      ["Active", 5, 100],
      ["Voted", 3, 60],
      ["RSVPed", 3, 60],
      ["Hosted", 3, 60],
    ]);
  });

  it("says No data (null) for the attendee reports when none exist", async () => {
    await getRepositories().sessions.setAttendeeCount(ids.s1, null);
    const s = await stats();
    expect(
      cell(s, "overview-headline", "Sessions with an attendee report")
    ).toBeNull();
  });

  it("offers every location and host to exclude", async () => {
    const s = await stats();
    expect(s.filterOptions.locations.map((l) => l.name).sort()).toEqual([
      "Main Hall",
      "Volunteers 1",
    ]);
    expect(s.filterOptions.hosts.map((h) => h.name).sort()).toEqual(
      hostNames.slice().sort()
    );
  });
});

describe("the statistics filter", { tags: ["021-US3"] }, () => {
  const volunteers = () =>
    `?excludeLocations=${ids.vol}&excludeHosts=${ids.v}&excludeOrigins=blocker`;

  it("drops the volunteer location and host from sessions and people", async () => {
    const s = await stats(volunteers());
    expect(cell(s, "overview-headline", "Members")).toBe(4);
    expect(cell(s, "overview-headline", "Active members")).toBe(3);
    expect(cell(s, "overview-headline", "Sessions")).toBe(2);
    expect(cell(s, "overview-headline", "Hosts")).toBe(2);
    expect(cell(s, "overview-headline", "People with RSVPs")).toBe(2);
    expect(cell(s, "overview-funnel", "Hosted")).toBe(2);
    expect(s.filterSummary).toBe("Excluding 1 location, 1 host, blockers");
  });

  it("drops proposals whose hosts are all excluded", async () => {
    const s = await stats(`?excludeHosts=${ids.a}`);
    expect(cell(s, "overview-headline", "Proposals")).toBe(1);
  });

  it("counts a repeated origin once", async () => {
    const s = await stats("?excludeOrigins=blocker,blocker");
    expect(s.filterSummary).toBe("Excluding blockers");
  });

  it("counts a host who is not a member in both Hosts figures", async () => {
    const outsider = await createGuest({ name: "Outside Host" });
    await createSession(eventId, { hostIds: [outsider.id] });
    const s = await stats();
    expect(cell(s, "overview-headline", "Hosts")).toBe(
      cell(s, "overview-funnel", "Hosted")
    );
  });

  it("keeps blockers when the origins list is sent empty", async () => {
    const s = await stats("?excludeOrigins=");
    expect(cell(s, "overview-headline", "Sessions")).toBe(4);
    expect(s.filterSummary).toBe("No exclusions");
  });

  it("excludes sessions by origin", async () => {
    const s = await stats("?excludeOrigins=blocker,organizer,spontaneous");
    expect(cell(s, "overview-headline", "Sessions")).toBe(1);
  });

  it("excludes a session only when all its locations are excluded", async () => {
    const { sessions } = getRepositories();
    const room = (await getRepositories().locations.listByEvent(eventId)).find(
      (l) => l.name === "Main Hall"
    );
    const s3 = (await sessions.listByEvent(eventId)).find((s) =>
      s.hosts.some((h) => h.id === ids.v)
    );
    await sessions.update(s3!.id, { locationIds: [ids.vol, room!.id] });
    const s = await stats(`?excludeLocations=${ids.vol}`);
    expect(cell(s, "overview-headline", "Sessions")).toBe(3);
  });
});

describe("statistics downloads", { tags: ["021-US2"] }, () => {
  it("serves one table as CSV with a BOM and a filtered file name", async () => {
    const res = await get(
      `/admin/events/${eventId}/stats/overview-funnel.csv?excludeHosts=${ids.v}`
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toMatch(
      /filename="[^"]*overview-funnel-filtered\.csv"/
    );
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = new TextDecoder().decode(bytes);
    expect(text.startsWith("Step,Members,Share of members (%)\r\n")).toBe(true);
    expect(text).toContain("Members,4,100\r\n");
  });

  it("answers 404 for an unknown table", async () => {
    const res = await get(`/admin/events/${eventId}/stats/nope.csv`);
    expect(res.status).toBe(404);
  });

  it("zips every table with an about.txt", async () => {
    const res = await get(`/admin/events/${eventId}/stats.zip`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/zip");
    const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
    const names = Object.keys(files).sort();
    expect(names.some((n) => n.endsWith("overview-headline.csv"))).toBe(true);
    expect(names.some((n) => n.endsWith("overview-funnel.csv"))).toBe(true);
    const about = strFromU8(files[names.find((n) => n.endsWith("about.txt"))!]);
    expect(about).toContain("Excluding blockers");
  });
});

describe("statistics access and privacy", { tags: ["021-US1"] }, () => {
  it("refuses everyone but a site admin", async () => {
    const guest = await createGuest({ name: "Plain Member", eventId });
    const plain = `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(guest.id)}`;
    for (const path of ["", "/overview-funnel.csv", ".zip"]) {
      const url = `/admin/events/${eventId}/stats${path}`;
      expect((await get(url, "")).status).toBe(403);
      expect((await get(url, plain)).status).toBe(403);
    }
  });

  it("answers 404 for an unknown event", async () => {
    expect((await get("/admin/events/nope/stats")).status).toBe(404);
  });

  it("carries no guest id and no name of someone who only attended", async () => {
    const json = JSON.stringify(await stats());
    const csv = await (
      await get(`/admin/events/${eventId}/stats/overview-funnel.csv`)
    ).text();
    for (const text of [json, csv]) {
      expect(text).not.toContain(ids.c);
      expect(text).not.toContain(ids.d);
      for (const name of nonHostNames) expect(text).not.toContain(name);
    }
  });
});
