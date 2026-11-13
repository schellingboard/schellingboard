// @module-tag 022-US1
import type { Day } from "@schellingboard/domain/event";
import { Settings } from "luxon";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { formatDayLabel } from "./day-label";

const dayIn = (start: string, end: string) =>
  ({ start: new Date(start), end: new Date(end) }) as Day;

describe("formatDayLabel", () => {
  const before = Settings.defaultLocale;
  beforeEach(() => {
    Settings.defaultLocale = "en-GB";
  });
  afterEach(() => {
    Settings.defaultLocale = before;
  });

  it("names the weekday and date in the event's zone, not the runner's", () => {
    const day = dayIn("2025-06-15T23:30:00Z", "2025-06-16T15:00:00Z");
    expect(formatDayLabel(day, "Europe/Berlin")).toBe("Monday 16 June");
    expect(formatDayLabel(day, "America/New_York")).toBe(
      "Sunday 15 June (until 11:00 Mon)"
    );
  });

  it("adds no suffix for a day that ends on its own date", () =>
    expect(
      formatDayLabel(
        dayIn("2025-06-15T07:00:00Z", "2025-06-15T16:00:00Z"),
        "Europe/Berlin"
      )
    ).toBe("Sunday 15 June"));

  it("treats a day ending exactly at midnight as not spilling over", () =>
    expect(
      formatDayLabel(
        dayIn("2025-06-15T07:00:00Z", "2025-06-15T22:00:00Z"),
        "Europe/Berlin"
      )
    ).toBe("Sunday 15 June"));

  it("uses the given time format for where the day ends @014-US7", () =>
    expect(
      formatDayLabel(
        dayIn("2026-06-13T09:00:00Z", "2026-06-14T03:00:00Z"),
        "UTC",
        "h:mm a"
      )
    ).toBe("Saturday 13 June (until 3:00 am Sun)"));

  it("writes the date in the format locale's word order", () => {
    Settings.defaultLocale = "de";
    expect(
      formatDayLabel(
        dayIn("2025-06-15T07:00:00Z", "2025-06-15T16:00:00Z"),
        "Europe/Berlin"
      )
    ).toBe("Sonntag, 15. Juni");
  });
});
