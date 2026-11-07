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
