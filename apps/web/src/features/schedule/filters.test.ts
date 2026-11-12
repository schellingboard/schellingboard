// @module-tag 007-US3
import { describe, it, expect } from "vitest";
import {
  parseScheduleFilters,
  serializeScheduleFilters,
  sessionPassesFilters,
} from "./filters";

describe("schedule filters", () => {
  it("is off without the param", () => {
    expect(parseScheduleFilters(null, null)).toEqual({ mine: null });
    expect(parseScheduleFilters("nope", null)).toEqual({ mine: null });
  });

  it("turns My schedule on with both kinds unless `mine` narrows them", () => {
    expect(parseScheduleFilters("mine", null)).toEqual({
      mine: ["rsvpd", "hosting"],
    });
    expect(parseScheduleFilters("mine", "hosting")).toEqual({
      mine: ["hosting"],
    });
    expect(parseScheduleFilters("mine", "hosting,rsvpd,nope")).toEqual({
      mine: ["rsvpd", "hosting"],
    });
    expect(parseScheduleFilters("mine", "nope")).toEqual({
      mine: ["rsvpd", "hosting"],
    });
  });

  it("maps old links to My schedule with that kind", () => {
    expect(parseScheduleFilters("rsvpd", null)).toEqual({ mine: ["rsvpd"] });
    expect(parseScheduleFilters("hosting", null)).toEqual({
      mine: ["hosting"],
    });
    expect(parseScheduleFilters("rsvpd,hosting", null)).toEqual({
      mine: ["rsvpd", "hosting"],
    });
  });

  it("serializes all three kinds", () => {
    expect(
      serializeScheduleFilters({ mine: ["rsvpd", "hosting", "bookmarked"] })
    ).toEqual({ filter: "mine", mine: "rsvpd,hosting,bookmarked" });
  });

  it("turns the Hidden chip on with `filter=hidden`, unless My schedule is also named", () => {
    expect(parseScheduleFilters("hidden", null)).toEqual({
      mine: null,
      hidden: true,
    });
    expect(parseScheduleFilters("mine,hidden", null)).toEqual({
      mine: ["rsvpd", "hosting"],
    });
  });

  it("serializes the Hidden chip as its own filter", () => {
    expect(serializeScheduleFilters({ mine: null, hidden: true })).toEqual({
      filter: "hidden",
      mine: null,
    });
  });

  it("serializes `mine` only when the kinds are not the default", () => {
    expect(serializeScheduleFilters({ mine: null })).toEqual({
      filter: null,
      mine: null,
    });
    expect(serializeScheduleFilters({ mine: ["hosting", "rsvpd"] })).toEqual({
      filter: "mine",
      mine: null,
    });
    expect(serializeScheduleFilters({ mine: ["hosting"] })).toEqual({
      filter: "mine",
      mine: "hosting",
    });
  });

  it("lets through a session of any ticked kind", () => {
    const rsvpd = { rsvpd: true, hosting: false, bookmarked: false };
    const hosting = { rsvpd: false, hosting: true, bookmarked: false };
    const neither = { rsvpd: false, hosting: false, bookmarked: false };
    const both = { mine: ["rsvpd", "hosting"] } as const;
    expect(sessionPassesFilters(both, rsvpd)).toBe(true);
    expect(sessionPassesFilters(both, hosting)).toBe(true);
    expect(sessionPassesFilters(both, neither)).toBe(false);
    expect(sessionPassesFilters({ mine: ["rsvpd"] }, hosting)).toBe(false);
    expect(sessionPassesFilters({ mine: null }, neither)).toBe(true);
  });
});
