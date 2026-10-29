import { describe, expect, it } from "vitest";
import { iso, snapshot } from "../../replica/snapshot-fixture";
import {
  closestAtMost,
  dayFrom,
  hostClashLine,
  minutesPastGrid,
  startTimesFor,
  type SessionRow,
} from "./session-model";

const day = dayFrom(snapshot.days[0]);
const session = (patch: Partial<SessionRow>): SessionRow => ({
  ...snapshot.sessions[0],
  ...patch,
});
const times = (rows: ReturnType<typeof startTimesFor>) =>
  Object.fromEntries(rows.map((r) => [r.label, r]));

const base = {
  day,
  unavailability: [],
  event: snapshot.event,
  staysInRooms: false,
};

describe("startTimesFor", { tags: ["008-US1"] }, () => {
  it("offers every slot of the booking hours while no room is chosen", () => {
    const rows = startTimesFor({
      ...base,
      sessions: [],
      own: undefined,
      roomIds: [],
    });

    expect(rows).toHaveLength(16);
    expect(rows[0]).toMatchObject({ label: "09:10", available: true });
    expect(rows.every((r) => r.maxDuration === 120)).toBe(true);
  });

  it("rules out slots a session in a chosen room occupies and ends the next run there", () => {
    const rows = times(
      startTimesFor({
        ...base,
        sessions: [session({ startTime: iso(11), endTime: iso(12) })],
        own: undefined,
        roomIds: ["r"],
      })
    );

    expect(rows["11:10"].available).toBe(false);
    expect(rows["10:40"].available).toBe(true);
    expect(rows["09:10"].maxDuration).toBe(120);
    expect(rows["10:10"].maxDuration).toBe(60);
  });

  it("ignores the session being edited and sessions in other rooms", () => {
    const rows = times(
      startTimesFor({
        ...base,
        sessions: [
          session({ id: "me", startTime: iso(11), endTime: iso(12) }),
          session({
            id: "x",
            locationIds: ["other"],
            startTime: iso(13),
            endTime: iso(14),
          }),
        ],
        own: session({ id: "me", startTime: iso(11), endTime: iso(12) }),
        roomIds: ["r"],
      })
    );

    expect(rows["11:10"].available).toBe(true);
    expect(rows["13:10"].available).toBe(true);
  });

  it("rules out slots a room is unavailable in", () => {
    const rows = times(
      startTimesFor({
        ...base,
        sessions: [],
        own: undefined,
        unavailability: snapshot.unavailability,
        roomIds: ["r"],
      })
    );

    expect(rows["12:10"].available).toBe(false);
  });

  it("keeps the slot a session sits in off the grid while it stays put", () => {
    const own = session({
      id: "me",
      startTime: new Date(Date.UTC(2026, 5, 15, 9, 45)).toISOString(),
      endTime: iso(11),
    });
    const args = { ...base, sessions: [own], own, roomIds: ["r"] };

    const staying = startTimesFor({ ...args, staysInRooms: true });
    const moving = startTimesFor({ ...args, staysInRooms: false });

    expect(staying.find((r) => r.label === "09:45")).toMatchObject({
      available: true,
    });
    expect(moving.find((r) => r.label === "09:45")).toBeUndefined();
  });
});

describe("duration helpers", () => {
  it("measures how far a slot sits past the grid", () => {
    const at = (m: number) => Date.UTC(2026, 5, 15, 8, m);
    expect(minutesPastGrid(at(30), day.start, 30)).toBe(0);
    expect(minutesPastGrid(at(45), day.start, 30)).toBe(15);
    expect(minutesPastGrid(at(-5), day.start, 30)).toBe(25);
  });

  it("falls back to the longest choice that still fits", () => {
    expect(closestAtMost([30, 60, 90], 75)).toBe(60);
    expect(closestAtMost([30, 60, 90], 10)).toBe(30);
    expect(closestAtMost([], 10)).toBe(0);
  });
});

describe("hostClashLine", () => {
  it("names a hosted session, and calls anything else busy", () => {
    const interval = { start: iso(9), end: iso(10) };
    expect(
      hostClashLine(
        { guestName: "Mia", kind: "hosting", title: "Rust", ...interval },
        "UTC"
      )
    ).toBe("Mia is hosting Rust from 09:00 to 10:00");
    expect(
      hostClashLine(
        { guestName: "Mia", kind: "busy", title: null, ...interval },
        "Europe/Berlin"
      )
    ).toBe("Mia is busy from 11:00 to 12:00");
  });
});
