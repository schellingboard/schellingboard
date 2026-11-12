import { toMeetingClashes } from "@schellingboard/domain/meeting-clash-text";
import { describe, expect, it } from "vitest";

describe("toMeetingClashes", () => {
  const hosting = {
    guestId: "grace",
    guestName: "Grace",
    kind: "hosting" as const,
    title: "Microservices for Dummies",
  };
  const meeting = {
    guestId: "grace",
    guestName: "Grace",
    kind: "meeting" as const,
    title: null,
  };

  it("keeps the viewer's own commitment, title and all", () => {
    expect(toMeetingClashes([hosting], "grace")).toEqual([
      {
        guestName: "Grace",
        kind: "hosting",
        title: "Microservices for Dummies",
        isViewer: true,
      },
    ]);
  });

  // What someone else has on at that hour is theirs to tell. The browser is
  // told they are taken and nothing else -- not the session, not whether they
  // are hosting it, RSVP'd to it or meeting someone else.
  it("reduces anyone else's to the bare fact that they are taken", () => {
    expect(toMeetingClashes([hosting], "ada")).toEqual([
      { guestName: "Grace", kind: "busy", title: null, isViewer: false },
    ]);
  });

  // How many things they have on is as much theirs as what those things are.
  it("collapses what redacts to the same thing", () => {
    expect(toMeetingClashes([hosting, meeting], "ada")).toEqual([
      { guestName: "Grace", kind: "busy", title: null, isViewer: false },
    ]);
  });
});
