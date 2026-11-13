import { dateOnDay, type Day } from "@schellingboard/domain/event";
import { durationMinusBreak } from "@schellingboard/domain/slots";
import {
  formatDuration,
  formatOptionalTime,
  formatSlotLabel,
  getPercentThroughDay,
  TIME_FORMAT,
} from "@schellingboard/domain/time";
import { describe, expect, it } from "vitest";

import { eventNameToSlug, normalizeWebsiteUrl } from "@/utils/utils";

// ── durationMinusBreak ───────────────────────────────────────────────────────

describe("durationMinusBreak", () => {
  it("60 min, 10 break → 50", () =>
    expect(durationMinusBreak(60, 10)).toBe(50));
  it("30 min, 5 break → 25", () => expect(durationMinusBreak(30, 5)).toBe(25));
  it("90 min, 10 break → 80", () =>
    expect(durationMinusBreak(90, 10)).toBe(80));
  it("0 break → unchanged", () => expect(durationMinusBreak(60, 0)).toBe(60));
  it("clamps to 0 when break ≥ duration", () =>
    expect(durationMinusBreak(10, 10)).toBe(0));
});

// ── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("45 short format → '45m'", () => expect(formatDuration(45)).toBe("45m"));
  it("45 long format → '45 minutes'", () =>
    expect(formatDuration(45, true)).toBe("45 minutes"));

  it("60 short format → '1h'", () => expect(formatDuration(60)).toBe("1h"));
  it("60 long format → '1 hour'", () =>
    expect(formatDuration(60, true)).toBe("1 hour"));

  it("90 short format → '1h 30m'", () =>
    expect(formatDuration(90)).toBe("1h 30m"));
  it("90 long format → '1 hour 30 minutes'", () =>
    expect(formatDuration(90, true)).toBe("1 hour 30 minutes"));

  it("120 short format → '2h'", () => expect(formatDuration(120)).toBe("2h"));
  it("120 long format → '2 hours'", () =>
    expect(formatDuration(120, true)).toBe("2 hours"));
});

// ── eventNameToSlug ──────────────────────────────────────────────────────────

describe("eventNameToSlug", () => {
  it("replaces spaces with hyphens", () =>
    expect(eventNameToSlug("My Event")).toBe("My-Event"));

  it("multiple spaces", () =>
    expect(eventNameToSlug("Foo Bar Baz")).toBe("Foo-Bar-Baz"));

  it("keeps hyphens already in the name", () =>
    expect(eventNameToSlug("My-Event 2026")).toBe("My-Event-2026"));

  it("replaces path separators so the slug stays a single URL segment", () =>
    expect(eventNameToSlug("A/B Workshop")).toBe("A-B-Workshop"));

  it("strips reserved URL characters", () =>
    expect(eventNameToSlug("Foo?#Bar&Baz")).toBe("Foo-Bar-Baz"));

  it("collapses runs of unsafe characters and trims edge hyphens", () =>
    expect(eventNameToSlug(" /Foo -- Bar/ ")).toBe("Foo-Bar"));

  it("keeps non-ASCII letters", () =>
    expect(eventNameToSlug("Café Sessions")).toBe("Café-Sessions"));

  it("returns an empty slug when nothing safe remains", () =>
    expect(eventNameToSlug("///")).toBe(""));
});

// ── normalizeWebsiteUrl ──────────────────────────────────────────────────────

describe("normalizeWebsiteUrl", () => {
  it("adds an https:// scheme to a bare domain", () =>
    expect(normalizeWebsiteUrl("example.com")).toBe("https://example.com"));

  it("leaves an https:// URL unchanged", () =>
    expect(normalizeWebsiteUrl("https://example.com")).toBe(
      "https://example.com"
    ));

  it("leaves an http:// URL unchanged", () =>
    expect(normalizeWebsiteUrl("http://example.com")).toBe(
      "http://example.com"
    ));

  it("is case-insensitive about an existing scheme", () =>
    expect(normalizeWebsiteUrl("HTTPS://example.com")).toBe(
      "HTTPS://example.com"
    ));

  it("trims surrounding whitespace", () =>
    expect(normalizeWebsiteUrl("  example.com  ")).toBe("https://example.com"));

  it("returns an empty string unchanged", () =>
    expect(normalizeWebsiteUrl("")).toBe(""));

  it("returns an empty string for whitespace-only input", () =>
    expect(normalizeWebsiteUrl("   ")).toBe(""));
});

// ── dateOnDay ────────────────────────────────────────────────────────────────

const DAY: Day = {
  id: "d1",
  start: new Date("2025-06-15T08:00:00Z"),
  end: new Date("2025-06-15T18:00:00Z"),
  startBookings: new Date("2025-06-15T09:00:00Z"),
  endBookings: new Date("2025-06-15T17:00:00Z"),
  eventId: "111",
  version: 1,
};

describe("dateOnDay", () => {
  it("returns true when date equals day start", () =>
    expect(dateOnDay(new Date("2025-06-15T08:00:00Z"), DAY)).toBe(true));

  it("returns true when date is within the day", () =>
    expect(dateOnDay(new Date("2025-06-15T12:00:00Z"), DAY)).toBe(true));

  it("returns true when date equals day end", () =>
    expect(dateOnDay(new Date("2025-06-15T18:00:00Z"), DAY)).toBe(true));

  it("returns false when date is before the day", () =>
    expect(dateOnDay(new Date("2025-06-15T07:59:59Z"), DAY)).toBe(false));

  it("returns false when date is after the day", () =>
    expect(dateOnDay(new Date("2025-06-15T18:00:01Z"), DAY)).toBe(false));
});

// ── formatSlotLabel ──────────────────────────────────────────────────────────

describe("formatSlotLabel", () => {
  const dayStart = new Date("2025-06-13T07:00:00Z"); // 09:00 Berlin

  it("shows the time alone for a slot on the day's own date", () =>
    expect(
      formatSlotLabel(
        new Date("2025-06-13T21:10:00Z"),
        dayStart,
        "Europe/Berlin"
      )
    ).toBe("23:10"));

  it("decides the date in the event's zone, not the runner's", () => {
    const slot = new Date("2025-06-13T23:10:00Z");
    expect(formatSlotLabel(slot, dayStart, "Europe/Berlin")).toBe("Sat 01:10");
    // Still the 13th in New York, where the day started at 03:00.
    expect(formatSlotLabel(slot, dayStart, "America/New_York")).toBe("19:10");
  });

  it("prefixes the weekday once the slot falls on the next date", () =>
    expect(
      formatSlotLabel(
        new Date("2025-06-13T23:10:00Z"),
        dayStart,
        "Europe/Berlin"
      )
    ).toBe("Sat 01:10"));
});

// ── getPercentThroughDay ─────────────────────────────────────────────────────

describe("getPercentThroughDay", () => {
  const start = new Date("2025-06-15T08:00:00Z");
  const end = new Date("2025-06-15T18:00:00Z");

  it("returns 0% at the start", () =>
    expect(getPercentThroughDay(start, start, end)).toBe(0));

  it("returns 100% at the end", () =>
    expect(getPercentThroughDay(end, start, end)).toBe(100));

  it("returns 50% at the midpoint", () => {
    const mid = new Date("2025-06-15T13:00:00Z");
    expect(getPercentThroughDay(mid, start, end)).toBe(50);
  });
});

// ── formatOptionalTime ───────────────────────────────────────────────────────

describe("formatOptionalTime", () => {
  it("formats a time in the event's zone", () => {
    expect(
      formatOptionalTime(
        new Date("2025-06-15T10:00:00Z"),
        "Europe/Berlin",
        TIME_FORMAT
      )
    ).toBe("12:00");
  });

  it("renders a placeholder instead of a plausible time when absent", () => {
    expect(formatOptionalTime(undefined, "Europe/Berlin", TIME_FORMAT)).toBe(
      "—"
    );
  });
});
