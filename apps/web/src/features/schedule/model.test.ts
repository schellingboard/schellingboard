// @module-tag 007-US3
import { describe, it, expect } from "vitest";
import type { Session } from "@schellingboard/domain/session";
import type { Location } from "@schellingboard/domain/location";
import {
  agendaDayFold,
  countMatches,
  createScheduleMatch,
  gridDayFold,
  includedLocations,
  scheduleEntries,
} from "./model";
import type { MeetingView } from "./meeting-view";
import { newEmptySession } from "@schellingboard/domain/session";

const room = (id: string, name: string) =>
  ({ id, name, color: "blue" }) satisfies Session["locations"][number];
const a = room("a", "Aula");
const b = room("b", "Barn");

const session = (id: string, patch: Partial<Session>): Session => ({
  ...newEmptySession("e"),
  id,
  title: id,
  locations: [a],
  startTime: new Date("2026-06-15T09:00:00Z"),
  endTime: new Date("2026-06-15T10:00:00Z"),
  ...patch,
});

const locations = [a, b] as unknown as Location[];
const day = (id: string, sessions: Session[], date = "2026-06-15") => ({
  id,
  eventId: "e",
  start: new Date(`${date}T08:00:00Z`),
  end: new Date(`${date}T18:00:00Z`),
  startBookings: new Date(),
  endBookings: new Date(),
  version: 1,
  sessions,
});
const meeting = { id: "m", otherName: "Kai", meetingPoint: "", message: "" };

const none = createScheduleMatch({
  search: "",
  filters: [],
  guestId: "mia",
  rsvpd: () => false,
});

describe("includedLocations", () => {
  it("is every room unless ?loc= names some", () => {
    expect(includedLocations(locations, [])).toEqual(locations);
    expect(includedLocations(locations, ["Barn"])).toEqual([locations[1]]);
    expect(includedLocations(locations, ["Nowhere"])).toEqual(locations);
  });
});

describe("createScheduleMatch", () => {
  it("is not filtering without a search or a chosen filter", () => {
    expect(none.filtering).toBe(false);
  });

  it("matches sessions by search and never blockers", () => {
    const m = createScheduleMatch({
      search: "talk",
      filters: [],
      guestId: null,
      rsvpd: () => false,
    });
    expect(m.filtering).toBe(true);
    expect(m.matchesSession(session("s", { title: "A TALK" }))).toBe(true);
    expect(m.matchesSession(session("s", { title: "Lunch" }))).toBe(false);
    expect(
      m.matchesSession(session("s", { title: "talk", blocker: true }))
    ).toBe(false);
  });

  it("applies the viewer's filters, and ignores them without a viewer", () => {
    const hosted = session("h", { hosts: [{ id: "mia", name: "Mia" }] });
    const m = createScheduleMatch({
      search: "",
      filters: ["hosting"],
      guestId: "mia",
      rsvpd: () => false,
    });
    expect(m.matchesSession(hosted)).toBe(true);
    expect(m.matchesSession(session("x", {}))).toBe(false);
    const anonymous = createScheduleMatch({
      search: "",
      filters: ["hosting"],
      guestId: null,
      rsvpd: () => false,
    });
    expect(anonymous.filtering).toBe(false);
  });

  it("keeps the viewer's 1-on-1s under every filter, narrowing by search only", () => {
    const m = createScheduleMatch({
      search: "kai",
      filters: ["hosting"],
      guestId: "mia",
      rsvpd: () => false,
    });
    expect(m.matchesMeeting(meeting as unknown as MeetingView)).toBe(true);
    expect(
      m.matchesMeeting({
        ...meeting,
        otherName: "Zoe",
      } as unknown as MeetingView)
    ).toBe(false);
  });
});

describe("scheduleEntries", () => {
  const days = [
    day("d1", [session("s1", {}), session("s2", { locations: [b] })]),
    day("d2", [], "2026-06-16"),
  ];

  it("narrows to the chosen rooms and totals what is there", () => {
    const entries = scheduleEntries({
      days,
      locations,
      locParams: ["Barn"],
      meetings: [],
      match: none,
    });
    expect(entries[0].sessions.map((s) => s.id)).toEqual(["s2"]);
    expect(entries[0].total).toBe(1);
  });

  it("filters sessions and meetings while filtering, counting matches", () => {
    const m = createScheduleMatch({
      search: "s1",
      filters: [],
      guestId: null,
      rsvpd: () => false,
    });
    const entries = scheduleEntries({
      days,
      locations,
      locParams: [],
      meetings: [],
      match: m,
    });
    expect(entries[0].sessions.map((s) => s.id)).toEqual(["s1"]);
    expect(countMatches(entries, m)).toEqual({ matching: 1, total: 2 });
    expect(countMatches(entries, none)).toBeNull();
  });

  it("puts a meeting on the day it starts, whatever the filters", () => {
    const m = {
      ...meeting,
      status: "accepted",
      slotStart: "2026-06-15T09:00:00.000Z",
    } as unknown as MeetingView;
    const entries = scheduleEntries({
      days,
      locations,
      locParams: [],
      meetings: [m],
      match: none,
    });
    expect(entries[0].meetings).toEqual([m]);
    expect(entries[1].meetings).toEqual([]);
  });
});

describe("day folds", () => {
  const folded = new Set(["past"]);

  it("grid: a passed day folds until opened", () => {
    const base = { filtering: false, defaultFolded: folded, empty: false };
    expect(
      gridDayFold({
        ...base,
        dayId: "past",
        unfolded: new Set(),
        openedEmpty: new Set(),
      })
    ).toEqual({ foldable: true, folded: true });
    expect(
      gridDayFold({
        ...base,
        dayId: "past",
        unfolded: new Set(["past"]),
        openedEmpty: new Set(),
      })
    ).toEqual({ foldable: true, folded: false });
    expect(
      gridDayFold({
        ...base,
        dayId: "today",
        unfolded: new Set(),
        openedEmpty: new Set(),
      })
    ).toEqual({ foldable: false, folded: false });
  });

  it("grid: while filtering only days without a match fold", () => {
    const base = {
      filtering: true,
      defaultFolded: folded,
      unfolded: new Set<string>(),
      openedEmpty: new Set<string>(),
    };
    expect(gridDayFold({ ...base, dayId: "past", empty: false })).toEqual({
      foldable: false,
      folded: false,
    });
    expect(gridDayFold({ ...base, dayId: "x", empty: true })).toEqual({
      foldable: true,
      folded: true,
    });
    expect(
      gridDayFold({
        ...base,
        openedEmpty: new Set(["x"]),
        dayId: "x",
        empty: true,
      })
    ).toEqual({ foldable: true, folded: false });
  });

  it("agenda: filtering unfolds every day and drops the bar", () => {
    expect(
      agendaDayFold({
        filtering: true,
        dayId: "past",
        defaultFolded: folded,
        unfolded: new Set(),
      })
    ).toEqual({ foldable: false, folded: false });
    expect(
      agendaDayFold({
        filtering: false,
        dayId: "past",
        defaultFolded: folded,
        unfolded: new Set(),
      })
    ).toEqual({ foldable: true, folded: true });
  });
});
