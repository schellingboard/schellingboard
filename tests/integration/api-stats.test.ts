import { unzipSync, strFromU8 } from "fflate";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { DEFAULT_EMAIL_SETTINGS } from "@schellingboard/domain/guest";
import { VoteChoice } from "@schellingboard/domain/vote";
import { getRepositories } from "@/db/container";
import { GUEST_COOKIE_NAME, verifiedGuestValue } from "../helpers/guest-cookie";
import { GET } from "@/tests/helpers/v1-route";
import { createAdminAuthCookie } from "../helpers/admin-cookie";
import { resetTestDb, setupTestDb } from "../helpers/db";
import {
  createEvent,
  createGuest,
  createDay,
  createLocation,
  createUnavailability,
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
  ids = {
    a: a.id,
    b: b.id,
    vol: vol.id,
    v: v.id,
    c: c.id,
    d: d.id,
    s1: s1.id,
    s2: s2.id,
    s3: s3.id,
    p1: p1.id,
    p2: p2.id,
    room: room.id,
  };
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

describe("session statistics", { tags: ["021-US1"] }, () => {
  const at = (hour: number, minute = 0) =>
    new Date(Date.UTC(2020, 2, 10, hour, minute));

  beforeEach(async () => {
    const { sessions } = getRepositories();
    await getRepositories().sessionComments.create({
      subjectId: ids.s1,
      authorId: ids.c,
      body: "See you there",
      createdTime: new Date(),
    });
    await sessions.update(ids.s1, {
      startTime: at(9),
      endTime: at(10),
      capacity: 1,
    });
    await sessions.update(ids.s2, { startTime: at(9, 30), endTime: at(11) });
    await sessions.update(ids.s3, {
      startTime: at(13),
      endTime: at(14),
      closed: true,
    });
  });

  const table = (s: Stats, id: string) => {
    const t = s.tables.find((x) => x.id === id);
    expect(t, id).toBeDefined();
    return t!;
  };
  const row = (s: Stats, id: string, first: string) => {
    const t = table(s, id);
    const found = t.rows.find((r) => r[0] === first);
    expect(found, `${id}/${first}`).toBeDefined();
    return Object.fromEntries(t.columns.map((c, i) => [c.key, found![i]]));
  };

  it("shows start, day and start hour in the event's time zone", async () => {
    const { events, sessions } = getRepositories();
    await events.update(eventId, { timezone: "America/New_York" });
    await sessions.update(ids.s3, { startTime: at(2), endTime: at(3) });
    const s = await stats();
    const rows = table(s, "sessions-table").rows;
    const late = rows.find((r) => r[1] === "organizer")!;
    expect(late.slice(2, 5)).toEqual([
      "2020-03-09",
      "2020-03-09 22:00",
      "2020-03-09 23:00",
    ]);
    expect(row(s, "sessions-by-hour", "22:00")).toMatchObject({ sessions: 1 });
    expect(row(s, "sessions-by-day", "2020-03-09")).toMatchObject({
      sessions: 1,
    });
  });

  it("lists one row per session with its figures", async () => {
    const s = await stats();
    expect(table(s, "sessions-table").rows).toHaveLength(3);
    const titled = table(s, "sessions-table").rows.find(
      (r) => r[1] === "proposal"
    )!;
    const first = Object.fromEntries(
      table(s, "sessions-table").columns.map((c, i) => [c.key, titled[i]])
    );
    expect(first).toMatchObject({
      origin: "proposal",
      start: "2020-03-10 09:00",
      end: "2020-03-10 10:00",
      duration: 60,
      locations: "Main Hall",
      hosts: "Ada Host",
      capacity: 1,
      rsvps: 2,
      fill: 200,
      reported: 20,
      perRsvp: 10,
      closed: false,
      parallel: 1,
      interest: 50,
      votes: 2,
      comments: 1,
    });
  });

  it("counts figures by origin", async () => {
    const s = await stats();
    expect(row(s, "sessions-origins", "proposal")).toMatchObject({
      sessions: 1,
      medianRsvps: 2,
      medianDuration: 60,
    });
    expect(row(s, "sessions-origins", "organizer")).toMatchObject({
      sessions: 1,
      medianRsvps: 1,
    });
  });

  it("tells how many ended sessions got an attendee report", async () => {
    const s = await stats();
    expect(row(s, "sessions-reports", "Sessions")).toMatchObject({
      asked: 3,
      reported: 1,
      share: 33.3,
    });
    expect(row(s, "sessions-reports", "Hosts")).toMatchObject({
      asked: 3,
      reported: 1,
    });
  });

  it("says No data for report shares when no session has a report", async () => {
    await getRepositories().sessions.setAttendeeCount(ids.s1, null);
    const s = await stats();
    expect(row(s, "sessions-reports", "Sessions")).toMatchObject({
      reported: null,
      share: null,
    });
  });

  it("counts sessions over capacity per location", async () => {
    const s = await stats();
    expect(row(s, "sessions-capacity", "Main Hall")).toMatchObject({
      sessions: 2,
      limited: 2,
      over: 1,
    });
    expect(table(s, "sessions-capacity").columns[3].label).toBe(
      "Sessions over capacity"
    );
  });

  it("compares closed and open sessions", async () => {
    const s = await stats();
    expect(row(s, "sessions-closed", "Closed")).toMatchObject({ sessions: 1 });
    expect(row(s, "sessions-closed", "Open")).toMatchObject({
      sessions: 2,
      medianRsvps: 1.5,
    });
  });

  it("groups by start hour and by day", async () => {
    const s = await stats();
    expect(row(s, "sessions-by-hour", "09:00")).toMatchObject({ sessions: 2 });
    expect(row(s, "sessions-by-day", "2020-03-10")).toMatchObject({
      sessions: 3,
    });
  });

  it("summarises the hosts", async () => {
    const s = await stats();
    expect(row(s, "sessions-hosts", "Hosts")).toMatchObject({ value: 3 });
    expect(
      row(s, "sessions-hosts", "Share of members who hosted (%)")
    ).toMatchObject({ value: 60 });
    expect(row(s, "sessions-per-host", "1")).toMatchObject({ hosts: 3 });
  });

  it("bins the durations and the attendance per RSVP", async () => {
    const s = await stats();
    const total = (id: string) =>
      table(s, id).rows.reduce((sum, r) => sum + Number(r[2]), 0);
    expect(total("sessions-duration")).toBe(3);
    expect(total("sessions-attendance-ratio")).toBe(1);
  });

  it("leaves out sessions of an excluded host and their RSVPs", async () => {
    const s = await stats(`?excludeHosts=${ids.b}`);
    const rows = table(s, "sessions-table").rows;
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r[1] === "proposal")![9]).toBe(1);
  });

  it("adds no empty bin above the last duration step", async () => {
    const s = await stats();
    expect(table(s, "sessions-duration").rows.at(-1)?.[1]).toBe(240);
  });

  describe("attendance prediction", { tags: ["021-US4"] }, () => {
    it("predicts the attendance of a proposal session from its votes", async () => {
      const s = await stats();
      const t = table(s, "sessions-table");
      const at = (key: string, origin: string) =>
        t.rows.find((r) => r[1] === origin)![
          t.columns.findIndex((c) => c.key === key)
        ] as number | null;
      expect(at("predicted", "proposal")).toBeCloseTo(2.83, 2);
      expect(at("low50", "proposal")).toBeCloseTo(1.54, 2);
      expect(at("high50", "proposal")).toBeCloseTo(5.2, 1);
      expect(at("low80", "proposal")!).toBeLessThan(at("low50", "proposal")!);
      expect(at("high80", "proposal")!).toBeGreaterThan(
        at("high50", "proposal")!
      );
      expect(at("predicted", "organizer")).toBeNull();
      expect(at("predicted", "spontaneous")).toBeNull();
    });

    it("checks how often the reported count lies in the predicted ranges", async () => {
      let s = await stats();
      expect(row(s, "sessions-calibration", "50% range")).toMatchObject({
        note: "too few to say",
        compared: 1,
        inside: 0,
        share: 0,
        expected: 50,
      });
      await getRepositories().sessions.setAttendeeCount(ids.s1, 3);
      s = await stats();
      expect(row(s, "sessions-calibration", "80% range")).toMatchObject({
        inside: 1,
        share: 100,
        expected: 80,
      });
    });

    it("has no calibration without a report, and no prediction without votes", async () => {
      const { sessions } = getRepositories();
      await sessions.setAttendeeCount(ids.s1, null);
      expect(table(await stats(), "sessions-calibration").rows).toEqual([]);
      await sessions.setAttendeeCount(ids.s1, 20);
      const s = await stats(`?excludeHosts=${ids.b}`);
      const t = table(s, "sessions-table");
      const proposal = t.rows.find((r) => r[1] === "proposal")!;
      expect(proposal[t.columns.findIndex((c) => c.key === "predicted")]).toBe(
        null
      );
    });

    it("does not move a prediction when a room is excluded", async () => {
      const base = await stats();
      const filtered = await stats(`?excludeLocations=${ids.vol}`);
      const predicted = (s: Stats) => {
        const t = table(s, "sessions-table");
        return t.rows.find((r) => r[1] === "proposal")![
          t.columns.findIndex((c) => c.key === "predicted")
        ];
      };
      expect(predicted(filtered)).toBe(predicted(base));
    });
  });

  it("carries no guest id and no non-host name in any session table", async () => {
    const json = JSON.stringify(
      (await stats()).tables.filter((t) => t.id.startsWith("sessions-"))
    );
    const csv = await (
      await get(`/admin/events/${eventId}/stats/sessions-table.csv`)
    ).text();
    for (const text of [json, csv]) {
      expect(text).not.toContain(ids.c);
      expect(text).not.toContain(ids.d);
      for (const name of nonHostNames) expect(text).not.toContain(name);
    }
    expect(csv).toContain("Ada Host");
  });
});

describe("proposal statistics", { tags: ["021-US1"] }, () => {
  let p3 = "";

  beforeEach(async () => {
    const { votes } = getRepositories();
    const { p1, p2 } = ids;
    const b = ids.b;
    const d = ids.d;
    const vote = (proposalId: string, guestId: string, choice: VoteChoice) =>
      votes.upsert({ proposalId, guestId, choice });
    p3 = (await createProposal(eventId, [ids.v])).id;
    await vote(p1, d, VoteChoice.interested);
    await vote(p2, d, VoteChoice.interested);
    await vote(p2, ids.c, VoteChoice.skip);
    await vote(p3, b, VoteChoice.interested);
    await vote(p3, d, VoteChoice.interested);
  });

  const table = (s: Stats, id: string) => {
    const t = s.tables.find((x) => x.id === id);
    expect(t, id).toBeDefined();
    return t!;
  };
  const rowsOf = (s: Stats, id: string) => {
    const t = table(s, id);
    return t.rows.map((r) =>
      Object.fromEntries(t.columns.map((c, i) => [c.key, r[i]]))
    );
  };
  const figure = (s: Stats, id: string, label: string) =>
    rowsOf(s, id).find((r) => Object.values(r)[0] === label)!;

  it("lists each proposal with its votes, rank and what became of it", async () => {
    const rows = rowsOf(await stats(), "proposals-table");
    expect(rows).toHaveLength(3);
    const first = rows.find((r) => r.hosts === "Ada Host")!;
    expect(first).toMatchObject({
      interested: 2,
      maybe: 1,
      skip: 0,
      voters: 3,
      interest: 66.7,
      rank: 1,
      session: true,
      rsvps: 2,
      reported: 20,
    });
    expect(first.created).toMatch(/^\d{4}-\d\d-\d\d \d\d:\d\d$/);
    const second = rows.find((r) => r.hosts === "Bob Host")!;
    expect(second).toMatchObject({ rank: 3, session: false, rsvps: null });
  });

  it("lists popular proposals that were never scheduled", async () => {
    const rows = rowsOf(await stats(), "proposals-unscheduled");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ hosts: "Vera Volunteer", interested: 2 });
  });

  it("counts proposals per day", async () => {
    const days = rowsOf(await stats(), "proposals-over-time");
    expect(days.reduce((sum, r) => sum + Number(r.proposals), 0)).toBe(3);
  });

  it("describes each voter under a pseudonym", async () => {
    const s = await stats();
    const rows = rowsOf(s, "proposals-voters");
    expect(rows).toHaveLength(4);
    expect(rows.map((r) => r.voter)).toEqual(["P001", "P002", "P003", "P004"]);
    expect(rows.reduce((sum, r) => sum + Number(r.total), 0)).toBe(8);
    expect(rows[0]).toMatchObject({ total: 3, coverage: 100 });
    expect(figure(s, "proposals-choice-mix", "Interested")).toMatchObject({
      value: 5,
    });
    expect(
      figure(s, "proposals-choice-mix", "Voters who voted on every proposal")
    ).toMatchObject({ value: 1, share: 25 });
  });

  it("summarises the hosts of proposals", async () => {
    const s = await stats();
    expect(figure(s, "proposals-hosts", "Hosts")).toMatchObject({ value: 3 });
    expect(
      figure(s, "proposals-hosts", "Proposals with more than one host")
    ).toMatchObject({ value: 0 });
    expect(rowsOf(s, "proposals-per-host")[0]).toMatchObject({
      proposals: "1",
      hosts: 3,
    });
  });

  it("converts proposals into sessions by interest quarter", async () => {
    const rows = rowsOf(await stats(), "proposals-conversion");
    expect(rows[0]).toMatchObject({ proposals: 1, sessions: 1, share: 100 });
    expect(rows.reduce((sum, r) => sum + Number(r.proposals), 0)).toBe(3);
  });

  it("drops proposals of an excluded host", async () => {
    const s = await stats(`?excludeHosts=${ids.v}`);
    expect(rowsOf(s, "proposals-table")).toHaveLength(2);
    expect(rowsOf(s, "proposals-unscheduled")).toEqual([]);
  });

  it("carries no guest id and no non-host name in a per-person table", async () => {
    const json = JSON.stringify(
      (await stats()).tables.filter((t) => t.id.startsWith("proposals-"))
    );
    const csv = await (
      await get(`/admin/events/${eventId}/stats/proposals-voters.csv`)
    ).text();
    for (const text of [json, csv]) {
      for (const id of [ids.a, ids.b, ids.c, ids.d, ids.v])
        expect(text).not.toContain(id);
      for (const name of nonHostNames) expect(text).not.toContain(name);
    }
  });
});

describe("who did what", { tags: ["021-US1"] }, () => {
  it("splits the members by voting and RSVPing, with mean RSVPs", async () => {
    const t = (await stats()).tables.find(
      (x) => x.id === "overview-who-did-what"
    );
    expect(t?.rows).toEqual([
      ["Voted only", 1, 20, 0],
      ["RSVPed only", 1, 20, 1],
      ["Voted and RSVPed", 2, 40, 1.5],
      ["Neither", 1, 20, 0],
      ["All voters", 3, 60, 1],
      ["All other members", 2, 40, 0.5],
    ]);
  });
});

describe("attendee statistics", { tags: ["021-US1"] }, () => {
  const at = (hour: number, minute = 0) =>
    new Date(Date.UTC(2020, 2, 10, hour, minute));

  beforeEach(async () => {
    const { sessions, rsvps } = getRepositories();
    await sessions.update(ids.s1, { startTime: at(9), endTime: at(10) });
    await sessions.update(ids.s2, { startTime: at(9, 30), endTime: at(11) });
    await sessions.update(ids.s3, { startTime: at(13), endTime: at(14) });
    await rsvps.create({ sessionId: ids.s2, guestId: ids.d });
  });

  const rowsOf = (s: Stats, id: string) => {
    const t = s.tables.find((x) => x.id === id);
    expect(t, id).toBeDefined();
    return t!.rows.map((r) =>
      Object.fromEntries(t!.columns.map((c, i) => [c.key, r[i]]))
    );
  };

  it("describes each attendee's RSVPs under a pseudonym", async () => {
    const rows = rowsOf(await stats(), "attendees-table");
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.attendee)).toEqual(["P001", "P002", "P003"]);
    expect(rows[0]).toMatchObject({
      rsvps: 2,
      days: 1,
      hours: 2.5,
      backToBack: 0,
      overlapping: 1,
      medianGap: null,
    });
    expect(rows[1]).toMatchObject({ rsvps: 2, overlapping: 0, medianGap: 120 });
    expect(rows[2]).toMatchObject({ rsvps: 1, hours: 1 });
  });

  it("counts the gaps between RSVPed sessions on a day", async () => {
    const rows = rowsOf(await stats(), "attendees-gaps");
    expect(rows.reduce((sum, r) => sum + Number(r.gaps), 0)).toBe(1);
    expect(rows.find((r) => r.gap === "Up to 2 h")).toMatchObject({ gaps: 1 });
  });

  it("counts people with double bookings", async () => {
    const rows = rowsOf(await stats(), "attendees-double-bookings");
    expect(rows[0]).toMatchObject({ value: 3 });
    expect(rows[1]).toMatchObject({ value: 1, share: 33.3 });
  });

  it("counts hosts who RSVP to other sessions", async () => {
    const rows = rowsOf(await stats(), "attendees-hosts");
    expect(rows[0]).toMatchObject({ value: 3 });
    expect(rows[1]).toMatchObject({ value: 1, share: 33.3 });
  });

  const onDay = (day: number, hour: number, minute = 0) =>
    new Date(Date.UTC(2020, 2, day, hour, minute));
  const attendeeOf = async (name: string, windows: [Date, Date][]) => {
    const guest = await createGuest({ name, eventId });
    for (const [startTime, endTime] of windows) {
      const session = await createSession(eventId, { startTime, endTime });
      await getRepositories().rsvps.create({
        sessionId: session.id,
        guestId: guest.id,
      });
    }
    return guest;
  };

  it("records no gap while a longer session is still running", async () => {
    await attendeeOf("Nested Nina", [
      [onDay(11, 9), onDay(11, 12)],
      [onDay(11, 10), onDay(11, 11)],
      [onDay(11, 11, 30), onDay(11, 12, 30)],
    ]);
    const rows = rowsOf(await stats(), "attendees-gaps");
    expect(rows.reduce((sum, r) => sum + Number(r.gaps), 0)).toBe(1);
  });

  it("treats a gap within the break as back to back", async () => {
    await attendeeOf("Break Bea", [
      [onDay(12, 9), onDay(12, 10)],
      [onDay(12, 10, 5), onDay(12, 11)],
    ]);
    const s = await stats();
    expect(rowsOf(s, "attendees-table").some((r) => r.backToBack === 1)).toBe(
      true
    );
    expect(
      rowsOf(s, "attendees-gaps").find((r) => r.gap === "Up to the break")
    ).toMatchObject({ gaps: 1 });
  });

  it("counts RSVPs to sessions without a time", async () => {
    const guest = await createGuest({ name: "Untimed Uri", eventId });
    const open = await createSession(eventId, {});
    await getRepositories().rsvps.create({
      sessionId: open.id,
      guestId: guest.id,
    });
    const s = await stats();
    expect(rowsOf(s, "attendees-double-bookings")[0].value).toBe(
      rowsOf(s, "overview-headline")[3].value
    );
    expect(
      rowsOf(s, "attendees-table").some((r) => r.rsvps === 1 && r.days === 0)
    ).toBe(true);
  });

  it("leaves an excluded host out of the people figures", async () => {
    const rows = rowsOf(
      await stats(`?excludeHosts=${ids.b}`),
      "attendees-table"
    );
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.rsvps === 1)).toBe(true);
  });

  it("carries no guest id and no name in the attendee tables", async () => {
    const json = JSON.stringify(
      (await stats()).tables.filter((t) => t.id.startsWith("attendees-"))
    );
    const csv = await (
      await get(`/admin/events/${eventId}/stats/attendees-table.csv`)
    ).text();
    for (const text of [json, csv]) {
      for (const id of [ids.a, ids.b, ids.c, ids.d, ids.v])
        expect(text).not.toContain(id);
      for (const name of [...hostNames, ...nonHostNames])
        expect(text).not.toContain(name);
    }
  });
});

describe("location statistics", { tags: ["021-US1"] }, () => {
  const at = (hour: number, minute = 0) =>
    new Date(Date.UTC(2020, 2, 10, hour, minute));

  beforeEach(async () => {
    const { sessions } = getRepositories();
    await sessions.update(ids.s1, { startTime: at(9), endTime: at(10) });
    await sessions.update(ids.s2, { startTime: at(9, 30), endTime: at(11) });
    await sessions.update(ids.s3, { startTime: at(13), endTime: at(14) });
  });

  const withDay = () =>
    createDay(eventId, {
      start: at(0),
      end: at(23),
      startBookings: at(8),
      endBookings: at(18),
    });

  const rowsOf = (s: Stats, id: string) => {
    const t = s.tables.find((x) => x.id === id);
    expect(t, id).toBeDefined();
    return t!.rows.map((r) =>
      Object.fromEntries(t!.columns.map((c, i) => [c.key, r[i]]))
    );
  };
  const location = (s: Stats, name: string) =>
    rowsOf(s, "locations-table").find((r) => r.location === name);

  it("measures booked time, gaps and utilization per location", async () => {
    await withDay();
    const hall = location(await stats(), "Main Hall");
    expect(hall).toMatchObject({
      sessions: 2,
      bookedHours: 2,
      availableHours: 10,
      utilization: 20,
      gaps: 2,
      fragments: 0,
      gapMinutes: 480,
      longestGap: 420,
      bookable: true,
    });
  });

  it("leaves unavailable time out of the available hours", async () => {
    await withDay();
    await createUnavailability(eventId, ids.room, at(17), at(18));
    const hall = location(await stats(), "Main Hall");
    expect(hall).toMatchObject({
      availableHours: 9,
      utilization: 22.2,
      gapMinutes: 420,
      longestGap: 360,
    });
  });

  it("counts a gap at the end of the window that fits a slot as usable", async () => {
    await withDay();
    await createSession(eventId, {
      locationIds: [ids.room],
      startTime: at(11),
      endTime: at(17, 30),
    });
    const hall = location(await stats(), "Main Hall");
    expect(hall).toMatchObject({ gaps: 2, fragments: 0, longestGap: 60 });
  });

  it("reports capacity, median RSVPs and sessions over capacity", async () => {
    await withDay();
    await getRepositories().sessions.update(ids.s1, { capacity: 1 });
    const hall = location(await stats(), "Main Hall");
    expect(hall).toMatchObject({ medianRsvps: 1.5, over: 1 });
    expect(hall?.capacity).toEqual(expect.any(Number));
  });

  it("buckets hours in the event's time zone", async () => {
    await getRepositories().events.update(eventId, {
      timezone: "Asia/Kolkata",
    });
    await withDay();
    const rows = rowsOf(await stats(), "locations-heatmap").filter(
      (r) => r.location === "Main Hall"
    );
    expect(rows[0]).toMatchObject({ day: "2020-03-10", hour: "13:00" });
    expect(rows.find((r) => r.hour === "14:00")?.booked).toBe(50);
  });

  it("keeps the repeated hour of a clock change apart", async () => {
    await getRepositories().events.update(eventId, {
      timezone: "America/New_York",
    });
    await createDay(eventId, {
      start: new Date(Date.UTC(2020, 10, 1, 4)),
      end: new Date(Date.UTC(2020, 10, 1, 12)),
      startBookings: new Date(Date.UTC(2020, 10, 1, 4)),
      endBookings: new Date(Date.UTC(2020, 10, 1, 8)),
    });
    const hours = rowsOf(await stats(), "locations-heatmap")
      .filter((r) => r.location === "Main Hall")
      .map((r) => r.hour);
    expect(hours).toEqual(["00:00", "01:00", "01:00 (again)", "02:00"]);
  });

  it("counts a gap shorter than a slot plus the break as a fragment", async () => {
    await withDay();
    await createSession(eventId, {
      locationIds: [ids.room],
      startTime: at(11, 20),
      endTime: at(12),
    });
    const hall = location(await stats(), "Main Hall");
    expect(hall).toMatchObject({ gaps: 2, fragments: 1 });
  });

  it("keeps excluded sessions and blockers as occupied time", async () => {
    await withDay();
    await createSession(eventId, {
      locationIds: [ids.room],
      blocker: true,
      startTime: at(15),
      endTime: at(16),
    });
    const hall = location(await stats(`?excludeHosts=${ids.b}`), "Main Hall");
    expect(hall).toMatchObject({
      sessions: 1,
      bookedHours: 3,
      utilization: 30,
    });
  });

  it("drops an excluded location from the location tables", async () => {
    await withDay();
    const s = await stats(`?excludeLocations=${ids.vol}`);
    expect(location(s, "Volunteers 1")).toBeUndefined();
    expect(
      rowsOf(s, "locations-heatmap").some((r) => r.location === "Volunteers 1")
    ).toBe(false);
  });

  it("says No data for utilization without booking days", async () => {
    expect(location(await stats(), "Main Hall")).toMatchObject({
      sessions: 2,
      utilization: null,
      gaps: null,
    });
    expect(rowsOf(await stats(), "locations-heatmap")).toEqual([]);
  });

  it("shows how booked each location is by hour of each day", async () => {
    await withDay();
    const rows = rowsOf(await stats(), "locations-heatmap").filter(
      (r) => r.location === "Main Hall"
    );
    const booked = (hour: string) => rows.find((r) => r.hour === hour)?.booked;
    expect(rows[0]).toMatchObject({ day: "2020-03-10" });
    expect(booked("08:00")).toBe(0);
    expect(booked("09:00")).toBe(100);
    expect(booked("10:00")).toBe(100);
    expect(booked("11:00")).toBe(0);
  });

  it("compares parallel sessions with RSVPs by hour", async () => {
    await withDay();
    const rows = rowsOf(await stats(), "locations-supply-demand");
    expect(rows.find((r) => r.hour === "09:00")).toMatchObject({
      day: "2020-03-10",
      sessions: 1.5,
      rsvps: 2.5,
    });
  });
});

describe("1-on-1 statistics", { tags: ["021-US1"] }, () => {
  const at = (hour: number, minute = 0, day = 10) =>
    new Date(Date.UTC(2020, 2, day, hour, minute));
  const FAR = new Date(Date.UTC(2099, 0, 1, 9));

  const rowsOf = (s: Stats, id: string) => {
    const t = s.tables.find((x) => x.id === id);
    expect(t, id).toBeDefined();
    return t!.rows.map((r) =>
      Object.fromEntries(t!.columns.map((c, i) => [c.key, r[i]]))
    );
  };
  const row = (s: Stats, id: string, label: string) =>
    rowsOf(s, id).find((r) => Object.values(r)[0] === label);

  const meet = async (
    from: string,
    to: string,
    slot: Date,
    point: string,
    outcome:
      | { status: "pending" }
      | { status: "accepted" | "declined" | "canceled"; after: number },
    created = at(8)
  ) => {
    const { meetings } = getRepositories();
    const m = await meetings.create({
      eventId,
      requesterId: from,
      recipientId: to,
      slotStart: slot,
      slotEnd: new Date(slot.getTime() + 30 * 60_000),
      meetingPoint: point,
      message: "",
      createdAt: created,
    });
    if (outcome.status !== "pending")
      await meetings.updateStatus(
        m.id,
        outcome.status,
        new Date(created.getTime() + outcome.after * 60_000),
        ["pending"]
      );
  };

  const withMeetings = async () => {
    const { meetingAvailability, meetingPoints } = getRepositories();
    await createDay(eventId, {
      start: at(8),
      end: at(18),
      startBookings: at(8),
      endBookings: at(18),
    });
    await meetingPoints.create({
      eventId,
      name: "Lobby",
      description: "",
      sortIndex: 0,
    });
    await meetingPoints.create({
      eventId,
      name: "Garden",
      description: "",
      sortIndex: 1,
    });
    await meetingAvailability.replaceForGuest(ids.a, eventId, [
      at(9),
      at(10),
      at(11),
    ]);
    await meetingAvailability.replaceForGuest(ids.c, eventId, [at(9)]);
    await meet(ids.c, ids.a, at(9), "Lobby", { status: "accepted", after: 30 });
    await meet(ids.d, ids.a, at(10), "lobby", {
      status: "declined",
      after: 120,
    });
    await meet(ids.c, ids.b, at(11), "Secret cafe", {
      status: "canceled",
      after: 10,
    });
    await meet(ids.d, ids.b, FAR, "Secret cafe", { status: "pending" });
    await meet(ids.c, ids.d, at(14), "Secret cafe", {
      status: "accepted",
      after: 60,
    });
    await meet(ids.d, ids.v, at(15), "Lobby", { status: "pending" });
  };

  it("has no 1-on-1 tables when the event never used them", async () => {
    const s = await stats();
    expect(s.tables.some((t) => t.id.startsWith("meetings-"))).toBe(false);
  });

  it("says No data when 1-on-1s are on but nobody used them", async () => {
    await getRepositories().events.update(eventId, { meetingsEnabled: true });
    const s = await stats();
    for (const id of [
      "meetings-slots",
      "meetings-status",
      "meetings-people",
      "meetings-per-person",
      "meetings-response",
      "meetings-when",
      "meetings-points",
    ])
      expect(rowsOf(s, id), id).toEqual([]);
  });

  it("counts a pending request as expired once its slot has started", async () => {
    await meet(ids.c, ids.a, new Date(Date.now() - 10 * 60_000), "Lobby", {
      status: "pending",
    });
    const s = await stats();
    expect(row(s, "meetings-status", "Expired")).toMatchObject({ requests: 1 });
    expect(row(s, "meetings-status", "Pending")).toMatchObject({ requests: 0 });
  });

  it("does not count availability outside the current days", async () => {
    await getRepositories().meetingAvailability.replaceForGuest(
      ids.a,
      eventId,
      [at(9), at(9, 30), at(20)]
    );
    await createDay(eventId, {
      start: at(8),
      end: at(10),
      startBookings: at(8),
      endBookings: at(10),
    });
    const s = await stats();
    expect(row(s, "meetings-adoption", "Slots offered")).toMatchObject({
      value: 2,
    });
  });

  it("merges organizer points that differ only in case", async () => {
    await getRepositories().meetingPoints.create({
      eventId,
      name: "lobby",
      description: "",
      sortIndex: 5,
    });
    await withMeetings();
    const points = rowsOf(await stats(), "meetings-points");
    expect(
      points.filter((r) => String(r.point).toLowerCase() === "lobby")
    ).toHaveLength(1);
    expect(points.reduce((sum, r) => sum + Number(r.share), 0)).toBe(100);
  });

  it("measures adoption of availability", async () => {
    await withMeetings();
    const s = await stats();
    expect(
      row(s, "meetings-adoption", "Members with availability")
    ).toMatchObject({ value: 2, share: 40 });
    expect(row(s, "meetings-adoption", "Slots offered")).toMatchObject({
      value: 4,
    });
    const slots = rowsOf(s, "meetings-slots");
    expect(slots.reduce((sum, r) => sum + Number(r.people), 0)).toBe(2);
  });

  it("counts requests by status, deriving expired ones", async () => {
    await withMeetings();
    const s = await stats();
    const status = (name: string) => row(s, "meetings-status", name);
    expect(status("Accepted")).toMatchObject({ requests: 2 });
    expect(status("Declined")).toMatchObject({ requests: 1 });
    expect(status("Canceled")).toMatchObject({ requests: 1 });
    expect(status("Pending")).toMatchObject({ requests: 1 });
    expect(status("Expired")).toMatchObject({ requests: 1, share: 16.7 });
    expect(row(s, "meetings-people", "Requested")).toMatchObject({ people: 2 });
    expect(row(s, "meetings-people", "Asked")).toMatchObject({ people: 4 });
    expect(row(s, "meetings-people", "With an accepted meeting")).toMatchObject(
      { people: 3, share: 60 }
    );
  });

  it("lists sent, received and accepted per person without ids or names", async () => {
    await withMeetings();
    const t = (await stats()).tables.find(
      (x) => x.id === "meetings-per-person"
    )!;
    const rows = t.rows.map((r) =>
      Object.fromEntries(t.columns.map((c, i) => [c.key, r[i]]))
    );
    expect(rows.map((r) => [r.sent, r.received, r.accepted])).toEqual([
      [3, 1, 1],
      [3, 0, 2],
      [0, 2, 1],
      [0, 2, 0],
      [0, 1, 0],
    ]);
    const res = await get(
      `/admin/events/${eventId}/stats/meetings-per-person.csv`
    );
    const text = JSON.stringify(rows) + (await res.text());
    for (const id of Object.values(ids)) expect(text).not.toContain(id);
    for (const name of [...hostNames, ...nonHostNames])
      expect(text).not.toContain(name);
  });

  it("times responses to accepted and declined requests", async () => {
    await withMeetings();
    const s = await stats();
    expect(row(s, "meetings-response", "Accepted")).toMatchObject({
      requests: 2,
      median: 45,
    });
    expect(row(s, "meetings-response", "Declined")).toMatchObject({
      requests: 1,
      median: 120,
    });
    expect(row(s, "meetings-response", "Accepted and declined")).toMatchObject({
      requests: 3,
      median: 60,
    });
  });

  it("shows accepted meetings by day and hour in the event's zone", async () => {
    await getRepositories().events.update(eventId, {
      timezone: "Asia/Kolkata",
    });
    await withMeetings();
    expect(rowsOf(await stats(), "meetings-when")).toEqual([
      { day: "2020-03-10", hour: "14:00", meetings: 1 },
      { day: "2020-03-10", hour: "19:00", meetings: 1 },
    ]);
  });

  it("counts organizer points by use and never shows typed places", async () => {
    await withMeetings();
    const s = await stats();
    expect(rowsOf(s, "meetings-points")).toEqual([
      { point: "Lobby", requests: 3, share: 50 },
      { point: "Garden", requests: 0, share: 0 },
      { point: "Other", requests: 3, share: 50 },
    ]);
    expect(JSON.stringify(s)).not.toContain("Secret");
    const csv = await get(`/admin/events/${eventId}/stats.zip`);
    expect(csv.status).toBe(200);
    const files = unzipSync(new Uint8Array(await csv.arrayBuffer()));
    for (const data of Object.values(files))
      expect(strFromU8(data)).not.toContain("Secret");
  });

  it("drops meetings of an excluded host from all figures", async () => {
    await withMeetings();
    const s = await stats(`?excludeHosts=${ids.a}`);
    expect(row(s, "meetings-status", "Accepted")).toMatchObject({
      requests: 1,
    });
    expect(row(s, "meetings-status", "Declined")).toMatchObject({
      requests: 0,
    });
    expect(
      row(s, "meetings-adoption", "Members with availability")
    ).toMatchObject({ value: 1 });
    expect(rowsOf(s, "meetings-per-person")).toHaveLength(4);
  });
});

describe(
  "profile, comment and notification statistics",
  {
    tags: ["021-US1"],
  },
  () => {
    const rowsOf = (s: Stats, id: string) => {
      const t = s.tables.find((x) => x.id === id);
      expect(t, id).toBeDefined();
      return t!.rows.map((r) =>
        Object.fromEntries(t!.columns.map((c, i) => [c.key, r[i]]))
      );
    };
    const row = (s: Stats, id: string, label: string) =>
      rowsOf(s, id).find((r) => Object.values(r)[0] === label);
    const has = (s: Stats, prefix: string) =>
      s.tables.some((t) => t.id.startsWith(prefix));
    const profile = (
      id: string,
      name: string,
      fields: Partial<{
        aboutMe: string;
        avatarUrl: string;
        pronouns: string;
        basedIn: string;
        languages: string[];
        prompts: { prompt: string; answer: string }[];
        contacts: { type: "signal"; value: string }[];
      }>
    ) =>
      getRepositories().guests.updateProfile(
        id,
        {
          name,
          aboutMe: null,
          avatarUrl: null,
          pronouns: null,
          basedIn: null,
          prompts: null,
          languages: null,
          contacts: null,
          ...fields,
        },
        new Date()
      );

    const withProfiles = async () => {
      await profile(ids.a, "Ada Host", {
        aboutMe: "Hello",
        avatarUrl: "/a.png",
        pronouns: "she/her",
        basedIn: "Berlin",
        languages: ["English", "German"],
        prompts: [{ prompt: "Ask me about", answer: "bees" }],
        contacts: [{ type: "signal", value: "+49 secret" }],
      });
      await profile(ids.b, "Bob Host", {
        basedIn: "Berlin",
        languages: ["english"],
      });
      await profile(ids.c, "Cleo Attendee", {
        aboutMe: "Hi",
        basedIn: "berlin",
        languages: ["English", "Klingon"],
      });
      await profile(ids.v, "Vera Volunteer", { basedIn: "Atlantis" });
    };

    it("has no profile tables when nobody filled in a profile", async () => {
      expect(has(await stats(), "profiles-")).toBe(false);
    });

    it("counts members with each profile field", async () => {
      await withProfiles();
      const s = await stats();
      expect(row(s, "profiles-fields", "About me")).toMatchObject({
        members: 2,
        share: 40,
      });
      expect(row(s, "profiles-fields", "Based in")).toMatchObject({
        members: 4,
      });
      expect(row(s, "profiles-fields", "Photo")).toMatchObject({ members: 1 });
      expect(row(s, "profiles-fields", "Contacts")).toMatchObject({
        members: 1,
      });
      expect(rowsOf(s, "profiles-filled").map((r) => r.people)).toEqual([
        1, 1, 1, 1, 0, 0, 0, 1,
      ]);
      expect(rowsOf(s, "profiles-contacts")).toEqual([
        { type: "Signal", members: 1 },
      ]);
    });

    it("shows a language or place only when three members share it", async () => {
      await withProfiles();
      const s = await stats();
      const lower = (id: string) =>
        rowsOf(s, id).map((r) => [String(r.value).toLowerCase(), r.members]);
      expect(lower("profiles-languages")).toEqual([
        ["english", 3],
        ["other", 2],
      ]);
      expect(lower("profiles-based-in")).toEqual([
        ["berlin", 3],
        ["other", 1],
      ]);
      const zip = await get(`/admin/events/${eventId}/stats.zip`);
      const everything =
        JSON.stringify(s) +
        Object.values(unzipSync(new Uint8Array(await zip.arrayBuffer())))
          .map((d) => strFromU8(d))
          .join("\n");
      for (const secret of ["Atlantis", "German", "Klingon", "+49", "bees"])
        expect(everything).not.toContain(secret);
    });

    it("leaves an excluded host out of the profile figures", async () => {
      await withProfiles();
      const s = await stats(`?excludeHosts=${ids.a}`);
      expect(row(s, "profiles-fields", "About me")).toMatchObject({
        members: 1,
      });
      expect(rowsOf(s, "profiles-languages")).toEqual([
        { value: "Other", members: 3 },
      ]);
    });

    it("has no comment tables when nobody commented", async () => {
      expect(has(await stats(), "comments-")).toBe(false);
    });

    describe("comments", () => {
      beforeEach(async () => {
        const { proposalComments, sessionComments, profileComments, comments } =
          getRepositories();
        const day = (hour: number) => new Date(Date.UTC(2020, 2, 10, hour));
        const c1 = await proposalComments.create({
          subjectId: ids.p1,
          authorId: ids.c,
          body: "one",
          createdTime: day(23),
        });
        await proposalComments.create({
          subjectId: ids.p1,
          authorId: ids.a,
          parentId: c1.id,
          body: "reply",
          createdTime: day(23),
        });
        for (const guestId of [ids.b, ids.d])
          await comments.setLike({
            commentId: c1.id,
            guestId,
            liked: true,
            createdTime: day(23),
          });
        const c2 = await sessionComments.create({
          subjectId: ids.s1,
          authorId: ids.d,
          body: "two",
          createdTime: day(9),
        });
        await comments.update(c2.id, { body: "two!", editedTime: day(10) });
        await sessionComments.create({
          subjectId: ids.s3,
          authorId: ids.c,
          body: "three",
          createdTime: day(9),
        });
        const c5 = await sessionComments.create({
          subjectId: ids.s2,
          authorId: ids.b,
          body: "five",
          createdTime: day(9),
        });
        await sessionComments.create({
          subjectId: ids.s2,
          authorId: ids.c,
          parentId: c5.id,
          body: "reply",
          createdTime: day(9),
        });
        await comments.delete(c5.id);
        await profileComments.create({
          subjectId: ids.a,
          authorId: ids.b,
          body: "nice profile",
          createdTime: day(9),
        });
      });

      it("counts comments, authors, replies, likes, edits and deletions per target", async () => {
        const s = await stats();
        expect(row(s, "comments-targets", "Proposals")).toMatchObject({
          comments: 2,
          authors: 2,
          replies: 1,
          likes: 2,
          edited: 0,
          deleted: 0,
        });
        expect(row(s, "comments-targets", "Sessions")).toMatchObject({
          comments: 3,
          authors: 2,
          replies: 1,
          edited: 1,
          deleted: 1,
        });
        expect(row(s, "comments-targets", "Profiles")).toMatchObject({
          comments: 1,
          authors: 1,
        });
      });

      it("leaves out comments on filtered sessions and by excluded hosts", async () => {
        let s = await stats(`?excludeHosts=${ids.v}`);
        expect(row(s, "comments-targets", "Sessions")).toMatchObject({
          comments: 2,
        });
        s = await stats(`?excludeHosts=${ids.b}`);
        expect(row(s, "comments-targets", "Sessions")).toMatchObject({
          comments: 2,
          deleted: 0,
        });
        expect(row(s, "comments-targets", "Profiles")).toMatchObject({
          comments: 0,
        });
        expect(row(s, "comments-targets", "Proposals")).toMatchObject({
          likes: 1,
        });
      });

      it("does not count a deleted account as an author", async () => {
        await getRepositories().guests.delete(ids.d);
        const s = await stats();
        expect(row(s, "comments-targets", "Sessions")).toMatchObject({
          comments: 3,
          authors: 1,
        });
      });

      it("counts comments per day in the event's zone", async () => {
        await getRepositories().events.update(eventId, {
          timezone: "Asia/Kolkata",
        });
        expect(rowsOf(await stats(), "comments-per-day")).toEqual([
          { day: "2020-03-10", comments: 4 },
          { day: "2020-03-11", comments: 2 },
        ]);
      });

      it("groups authors by how much they commented without ids or names", async () => {
        const s = await stats();
        const bins = rowsOf(s, "comments-per-author");
        expect(bins.reduce((sum, r) => sum + Number(r.authors), 0)).toBe(4);
        expect(bins[0]).toMatchObject({ from: 1, authors: 3 });
        expect(
          JSON.stringify(s.tables.filter((t) => t.id.startsWith("comments-")))
        ).not.toContain(ids.c);
      });
    });

    describe("notifications", () => {
      it("still lists notification tables when every member is an excluded host", async () => {
        const solo = await createEvent({ phase: "scheduling" });
        const host = await createGuest({ name: "Solo Host", eventId: solo.id });
        await createSession(solo.id, { hostIds: [host.id] });
        const res = await get(
          `/admin/events/${solo.id}/stats?excludeHosts=${host.id}`
        );
        const body = (await res.json()) as Stats;
        expect(body.tables.some((t) => t.id === "notifications-email")).toBe(
          true
        );
      });

      it("shows how many members have each email setting on", async () => {
        const { guests } = getRepositories();
        await guests.updateEmailSettings(ids.c, {
          ...DEFAULT_EMAIL_SETTINGS,
          rsvpChange: false,
          commentThread: true,
        });
        await guests.update(ids.v, {
          name: "Vera Volunteer",
          info: { email: null },
        });
        const s = await stats();
        expect(row(s, "notifications-email", "RSVP changes")).toMatchObject({
          members: 4,
          share: 80,
        });
        expect(
          row(s, "notifications-email", "Replies in a thread")
        ).toMatchObject({
          members: 1,
          share: 20,
        });
        expect(
          row(s, "notifications-email", "Members without an email address")
        ).toMatchObject({ members: 1, share: 20 });
      });

      it("counts members with a push subscription", async () => {
        const { push } = getRepositories();
        for (const [guestId, n] of [
          [ids.a, 1],
          [ids.a, 2],
          [ids.b, 3],
        ] as const)
          await push.saveSubscription({
            guestId,
            endpoint: `https://push.example/${n}`,
            p256dh: "k",
            auth: "a",
            createdAt: new Date(),
          });
        expect(
          row(await stats(), "notifications-push", "Members with push")
        ).toMatchObject({ members: 2, share: 40 });
      });

      it("counts notifications sent and read per type", async () => {
        const { notifications } = getRepositories();
        const send = async (
          guestId: string,
          type: "proposalComment" | "sessionComment",
          read: boolean
        ) => {
          const n = await notifications.create({
            guestId,
            type,
            text: "x",
            url: "/x",
            createdAt: new Date(),
          });
          if (read) await notifications.markRead(guestId, n.id, new Date());
        };
        await send(ids.a, "proposalComment", true);
        await send(ids.a, "proposalComment", false);
        await send(ids.b, "sessionComment", true);
        let s = await stats();
        expect(
          row(s, "notifications-inapp", "Comment on a proposal")
        ).toMatchObject({
          sent: 2,
          read: 1,
          share: 50,
        });
        s = await stats(`?excludeHosts=${ids.a}`);
        expect(
          row(s, "notifications-inapp", "Comment on a proposal")
        ).toBeUndefined();
        expect(
          row(s, "notifications-inapp", "Comment on a session")
        ).toMatchObject({
          sent: 1,
        });
      });
    });
  }
);
