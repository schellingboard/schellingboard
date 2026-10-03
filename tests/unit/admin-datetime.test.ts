import { describe, it, expect } from "vitest";
import {
  calendarDayOf,
  dayIndexOf,
  dayTimeToUtc,
  utcToZonedInput,
  zonedInputToUtc,
} from "@/utils/admin-datetime";

// ── utcToZonedInput ──────────────────────────────────────────────────────────

describe("utcToZonedInput", () => {
  it("converts a full UTC ISO string into the zone's datetime-local value", () =>
    expect(utcToZonedInput("2026-10-01T09:00:00.000Z", "Europe/Berlin")).toBe(
      "2026-10-01T11:00"
    ));

  it("keeps UTC values unchanged for the UTC zone", () =>
    expect(utcToZonedInput("2026-10-01T09:00:00.000Z", "UTC")).toBe(
      "2026-10-01T09:00"
    ));

  it("handles negative offsets crossing a date boundary", () =>
    expect(
      utcToZonedInput("2026-10-01T02:00:00.000Z", "America/New_York")
    ).toBe("2026-09-30T22:00"));

  it("applies DST-aware offsets (Berlin winter = +1)", () =>
    expect(utcToZonedInput("2026-01-15T09:00:00.000Z", "Europe/Berlin")).toBe(
      "2026-01-15T10:00"
    ));

  it("returns empty string for null/empty input", () => {
    expect(utcToZonedInput(null, "Europe/Berlin")).toBe("");
    expect(utcToZonedInput("", "Europe/Berlin")).toBe("");
  });

  it("falls back to UTC for an invalid timezone", () =>
    expect(utcToZonedInput("2026-10-01T09:00:00.000Z", "Not/AZone")).toBe(
      "2026-10-01T09:00"
    ));
});

// ── zonedInputToUtc ──────────────────────────────────────────────────────────

describe("zonedInputToUtc", () => {
  it("converts a zoned datetime-local value to a UTC datetime-local value", () =>
    expect(zonedInputToUtc("2026-10-01T11:00", "Europe/Berlin")).toBe(
      "2026-10-01T09:00"
    ));

  it("keeps UTC values unchanged for the UTC zone", () =>
    expect(zonedInputToUtc("2026-10-01T09:00", "UTC")).toBe(
      "2026-10-01T09:00"
    ));

  it("handles negative offsets crossing a date boundary", () =>
    expect(zonedInputToUtc("2026-09-30T22:00", "America/New_York")).toBe(
      "2026-10-01T02:00"
    ));

  it("returns empty string for empty input", () =>
    expect(zonedInputToUtc("", "Europe/Berlin")).toBe(""));

  it("returns empty string for an unparseable value", () =>
    expect(zonedInputToUtc("not-a-date", "Europe/Berlin")).toBe(""));

  it("falls back to UTC for an invalid timezone (round-trips with utcToZonedInput)", () =>
    expect(zonedInputToUtc("2026-10-01T09:00", "Not/AZone")).toBe(
      "2026-10-01T09:00"
    ));

  it("round-trips through utcToZonedInput across DST boundaries", () => {
    const utcIso = "2026-03-29T05:30:00.000Z";
    const zoned = utcToZonedInput(utcIso, "Europe/Berlin");
    expect(zonedInputToUtc(zoned, "Europe/Berlin")).toBe("2026-03-29T05:30");
  });
});

describe("dayTimeToUtc", () => {
  const tz = "Europe/Berlin";
  // Fri 2026-10-02 09:00 – 18:00 Berlin (UTC+2)
  const day = {
    start: "2026-10-02T07:00:00.000Z",
    end: "2026-10-02T16:00:00.000Z",
  };
  // Fri 2026-10-02 20:00 – Sat 03:00 Berlin
  const lateDay = {
    start: "2026-10-02T18:00:00.000Z",
    end: "2026-10-03T01:00:00.000Z",
  };

  it("puts the time on the day's date in the event zone", () =>
    expect(dayTimeToUtc(day, "12:30", tz)).toBe("2026-10-02T10:30:00.000Z"));

  it("keeps a time before the day's start on the same date", () =>
    expect(dayTimeToUtc(day, "08:00", tz)).toBe("2026-10-02T06:00:00.000Z"));

  it("moves a time past midnight onto the next date for a day running late", () =>
    expect(dayTimeToUtc(lateDay, "01:00", tz)).toBe(
      "2026-10-02T23:00:00.000Z"
    ));

  it("treats midnight as the end of a day that ends at midnight", () =>
    expect(
      dayTimeToUtc(
        { start: "2026-10-02T16:00:00.000Z", end: "2026-10-02T22:00:00.000Z" },
        "00:00",
        tz
      )
    ).toBe("2026-10-02T22:00:00.000Z"));

  it("returns empty string for an empty time", () =>
    expect(dayTimeToUtc(day, "", tz)).toBe(""));
});

describe("dayIndexOf", () => {
  const days = [
    { start: "2026-10-02T07:00:00.000Z", end: "2026-10-02T16:00:00.000Z" },
    { start: "2026-10-03T07:00:00.000Z", end: "2026-10-03T16:00:00.000Z" },
  ];

  const tz = "Europe/Berlin";

  it("finds the day a session starts on", () =>
    expect(dayIndexOf("2026-10-03T10:00:00.000Z", days, tz)).toBe(1));

  it("finds the day of a session starting before the day opens", () =>
    expect(dayIndexOf("2026-10-03T06:00:00.000Z", days, tz)).toBe(1));

  it("returns -1 for a start outside every day", () =>
    expect(dayIndexOf("2026-10-04T10:00:00.000Z", days, tz)).toBe(-1));
});

describe("calendarDayOf", () => {
  it("spans the local calendar date of the given instant", () =>
    expect(calendarDayOf("2026-10-02T23:30:00.000Z", "Europe/Berlin")).toEqual({
      start: "2026-10-02T22:00:00.000Z",
      end: "2026-10-03T22:00:00.000Z",
    }));
});
