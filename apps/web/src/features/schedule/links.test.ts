// @module-tag 007-US5
import { describe, it, expect } from "vitest";
import { legacyScheduleLinks } from "./links";

const links = legacyScheduleLinks("conf");

describe("legacyScheduleLinks", () => {
  it("opens a session over the current schedule view, keeping its params", () => {
    expect(links.session(new URLSearchParams("view=agenda"), "s1")).toBe(
      "/conf?view=agenda&viewSession=s1"
    );
  });

  it("points the modal's pages at the legacy app", () => {
    expect(links.guest("g1")).toBe("/guests/g1");
    expect(links.editSession("s1")).toBe(
      "/legacy/conf/edit-session?sessionID=s1"
    );
    expect(links.proposal("p1")).toBe("/conf/proposals?viewProposal=p1");
  });

  it("opens a 1-on-1 the same way", () => {
    expect(links.meeting(new URLSearchParams(), "m1")).toBe(
      "/conf?viewMeeting=m1"
    );
  });

  it("books into a free slot with its room, day and time", () => {
    expect(
      links.addSession({ location: "Aula A", day: "2026-06-15", time: "09:30" })
    ).toBe(
      "/legacy/conf/add-session?location=Aula+A&time=09%3A30&day=2026-06-15"
    );
  });

  it("books a free 1-on-1 slot on the schedule, which opens the request", () => {
    expect(links.bookMeeting("2026-06-15T10:00:00.000Z")).toBe(
      "/conf?bookMeeting=2026-06-15T10%3A00%3A00.000Z"
    );
  });

  it("links the proposals and the schedule", () => {
    expect(links.proposals).toBe("/conf/proposals");
    expect(links.schedule).toBe("/legacy/conf");
  });
});
