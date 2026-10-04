import { describe, it, expect } from "vitest";
import {
  CAPACITY_ERROR,
  sessionCapacityError,
  sessionPlacementError,
} from "@schellingboard/domain/session-booking";
import type {
  Session,
  SessionCreateInput,
} from "@schellingboard/domain/session";

const LOC_A = "loc-a";
const LOC_B = "loc-b";

// Deliberately behind real time: a session an hour after NOW is in the wall
// clock's past, so every "accepts" case below fails if the validator ever goes
// back to reading Date.now() instead of the clock it is handed.
const NOW = new Date("2026-06-01T10:00:00.000Z");

// minutes from NOW, the clock the validator is handed
const fromNow = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);

function makeInput(
  overrides?: Partial<SessionCreateInput>
): SessionCreateInput {
  return {
    title: "Test Session",
    description: "",
    capacity: 30,
    adminManaged: false,
    blocker: false,
    closed: false,
    hostIds: ["host-1"],
    locationIds: [LOC_A],
    startTime: fromNow(60),
    endTime: fromNow(120),
    eventId: "111",
    ...overrides,
  };
}

function makeExisting(
  start: Date,
  end: Date,
  locationId: string = LOC_A
): Session {
  return {
    id: "existing-1",
    title: "Existing",
    description: "",
    capacity: 30,
    adminManaged: false,
    blocker: false,
    closed: false,
    hosts: [],
    locations: [{ id: locationId, name: "Room", color: "#000" }],
    numRsvps: 0,
    startTime: start,
    endTime: end,
    eventId: "111",
  };
}

describe("sessionCapacityError", () => {
  // Absent is not a rejection: the routes then fall back to the room's own
  // maximum, which is what a client that never sends the field expects.
  it("accepts an absent capacity", () => {
    expect(sessionCapacityError(undefined)).toBeNull();
  });

  it("accepts 0, the existing 'no maximum' convention", () => {
    expect(sessionCapacityError(0)).toBeNull();
  });

  it("accepts a positive whole number", () => {
    expect(sessionCapacityError(12)).toBeNull();
  });

  // Each case is wrapped because `it.each` spreads a bare array over the
  // arguments.
  it.each([[-1], [2.5], [NaN], ["8"], [null], [{}]])(
    "rejects %p",
    (capacity) => {
      expect(sessionCapacityError(capacity)).toBe(CAPACITY_ERROR);
    }
  );
});

describe("sessionPlacementError", () => {
  it("accepts a valid session with no existing sessions", () => {
    expect(sessionPlacementError(makeInput(), [], NOW)).toBeNull();
  });

  it("rejects when start >= end", () => {
    const input = makeInput({
      startTime: fromNow(120),
      endTime: fromNow(60),
    });
    expect(sessionPlacementError(input, [], NOW)).toBe(
      "session.endsBeforeStart"
    );
  });

  it("rejects when start equals end", () => {
    const t = fromNow(60);
    expect(
      sessionPlacementError(makeInput({ startTime: t, endTime: t }), [], NOW)
    ).toBe("session.endsBeforeStart");
  });

  it("rejects when start is in the past", () => {
    const input = makeInput({
      startTime: fromNow(-60),
      endTime: fromNow(60),
    });
    expect(sessionPlacementError(input, [], NOW)).toBe("session.startsInPast");
  });

  // The other direction, which the NOW-based cases can't show: a start still in
  // the wall clock's future, rejected because the caller's clock has travelled
  // past it. A time-travelled organizer can't book into their own past.
  it("rejects a start that is past only for the clock it was given", () => {
    const realFuture = new Date(Date.now() + 60 * 60_000);
    const input = makeInput({
      startTime: realFuture,
      endTime: new Date(realFuture.getTime() + 60 * 60_000),
    });
    const travelledPastIt = new Date(realFuture.getTime() + 30 * 60_000);
    expect(sessionPlacementError(input, [], travelledPastIt)).toBe(
      "session.startsInPast"
    );
  });

  it("rejects when title is missing", () => {
    expect(sessionPlacementError(makeInput({ title: "" }), [], NOW)).toBe(
      "session.titleRequired"
    );
  });

  it("rejects when hostIds is empty", () => {
    expect(sessionPlacementError(makeInput({ hostIds: [] }), [], NOW)).toBe(
      "session.hostRequired"
    );
  });

  it("rejects when locationIds is empty", () => {
    expect(sessionPlacementError(makeInput({ locationIds: [] }), [], NOW)).toBe(
      "session.locationRequired"
    );
  });

  it("rejects partial overlap in same location (start-overlap)", () => {
    const existing = makeExisting(fromNow(30), fromNow(90));
    const input = makeInput({ startTime: fromNow(60), endTime: fromNow(120) });
    expect(sessionPlacementError(input, [existing], NOW)).toBe("session.clash");
  });

  it("rejects partial overlap in same location (end-overlap)", () => {
    const existing = makeExisting(fromNow(90), fromNow(150));
    const input = makeInput({ startTime: fromNow(60), endTime: fromNow(120) });
    expect(sessionPlacementError(input, [existing], NOW)).toBe("session.clash");
  });

  it("rejects when existing session is fully contained within new session", () => {
    const existing = makeExisting(fromNow(70), fromNow(110));
    const input = makeInput({ startTime: fromNow(60), endTime: fromNow(120) });
    expect(sessionPlacementError(input, [existing], NOW)).toBe("session.clash");
  });

  it("accepts back-to-back sessions in same location", () => {
    const existing = makeExisting(fromNow(0), fromNow(60));
    const input = makeInput({ startTime: fromNow(60), endTime: fromNow(120) });
    expect(sessionPlacementError(input, [existing], NOW)).toBeNull();
  });

  it("accepts overlapping sessions in different locations", () => {
    const existing = makeExisting(fromNow(60), fromNow(120), LOC_B);
    const input = makeInput({
      startTime: fromNow(60),
      endTime: fromNow(120),
      locationIds: [LOC_A],
    });
    expect(sessionPlacementError(input, [existing], NOW)).toBeNull();
  });

  it("rejects identical interval in same location", () => {
    const existing = makeExisting(fromNow(60), fromNow(120));
    const input = makeInput({ startTime: fromNow(60), endTime: fromNow(120) });
    expect(sessionPlacementError(input, [existing], NOW)).toBe("session.clash");
  });

  it("rejects same-start longer-end in same location", () => {
    const existing = makeExisting(fromNow(60), fromNow(180));
    const input = makeInput({ startTime: fromNow(60), endTime: fromNow(120) });
    expect(sessionPlacementError(input, [existing], NOW)).toBe("session.clash");
  });

  it("rejects same-end earlier-start in same location", () => {
    const existing = makeExisting(fromNow(30), fromNow(120));
    const input = makeInput({ startTime: fromNow(60), endTime: fromNow(120) });
    expect(sessionPlacementError(input, [existing], NOW)).toBe("session.clash");
  });
});
