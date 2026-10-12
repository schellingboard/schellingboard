// @module-tag 007-US5
import { describe, it, expect } from "vitest";
import { legacyScheduleLinks } from "./links";

const links = legacyScheduleLinks("conf");

describe("legacyScheduleLinks", () => {
  it("opens a session over the current schedule view, keeping its params", () => {
    expect(links.session(new URLSearchParams("view=agenda"), "s1")).toBe(
      "/legacy/conf?view=agenda&viewSession=s1"
    );
  });

  it("opens a 1-on-1 the same way", () => {
    expect(links.meeting(new URLSearchParams(), "m1")).toBe(
      "/legacy/conf?viewMeeting=m1"
    );
  });

  it("books into a free slot with its room, day and time", () => {
    expect(
      links.addSession({ location: "Aula A", day: "2026-06-15", time: "09:30" })
    ).toBe(
      "/legacy/conf/add-session?location=Aula+A&time=09%3A30&day=2026-06-15"
    );
  });

  it("links the proposals and the schedule", () => {
    expect(links.proposals).toBe("/legacy/conf/proposals");
    expect(links.schedule).toBe("/legacy/conf");
  });
});
