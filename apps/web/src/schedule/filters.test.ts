// @module-tag 007-US3
import { describe, it, expect } from "vitest";
import {
  parseScheduleFilters,
  serializeScheduleFilters,
  sessionPassesFilters,
} from "./filters";

describe("schedule filters", () => {
  it("parses the comma-separated param in canonical order, dropping unknowns", () => {
    expect(parseScheduleFilters("hosting,nope,mine")).toEqual([
      "mine",
      "hosting",
    ]);
    expect(parseScheduleFilters(null)).toEqual([]);
  });

  it("serializes canonically, null for none", () => {
    expect(serializeScheduleFilters(["hosting", "mine"])).toBe("mine,hosting");
    expect(serializeScheduleFilters([])).toBeNull();
  });

  it("narrows further with every active filter", () => {
    const rsvpd = { rsvpd: true, hosting: false };
    const hosting = { rsvpd: false, hosting: true };
    expect(sessionPassesFilters(["mine"], rsvpd)).toBe(true);
    expect(sessionPassesFilters(["mine"], hosting)).toBe(true);
    expect(sessionPassesFilters(["rsvpd"], hosting)).toBe(false);
    expect(sessionPassesFilters(["rsvpd", "hosting"], rsvpd)).toBe(false);
    expect(sessionPassesFilters([], { rsvpd: false, hosting: false })).toBe(
      true
    );
  });
});
