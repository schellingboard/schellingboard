// @module-tag 007-US1
import { describe, it, expect } from "vitest";
import { snapshot } from "../../replica/snapshot-fixture";
import { scheduleDataFrom } from "./data";

describe("scheduleDataFrom", () => {
  it("reads the schedule's shapes, the viewer's RSVPs and own 1-on-1s from a snapshot", () => {
    const now = new Date("2026-06-15T09:30:00Z");
    const data = scheduleDataFrom(snapshot, now);
    expect(data.now).toBe(now);
    expect(data.event.slug).toBe("conf");
    expect(data.days.map((d) => d.id)).toEqual(["d"]);
    expect(data.days[0].sessions.map((s) => s.id)).toEqual(["s"]);
    expect(data.guestId).toBe("mia");
    expect(data.rsvpd("s")).toBe(true);
    expect(data.rsvpd("unscheduled")).toBe(false);
    expect(data.meetings).toEqual([]);
  });

  it("hides a session the viewer marked, unless they RSVP'd or host it", () => {
    const marked = (sessionId: string, patch = {}) =>
      scheduleDataFrom(
        {
          ...snapshot,
          me: {
            ...snapshot.me!,
            marks: [{ sessionId, kind: "hidden" as const }],
            ...patch,
          },
        },
        new Date()
      );
    const rsvpd = marked("s");
    expect(rsvpd.rsvpd("s")).toBe(true);
    expect(rsvpd.hidden("s")).toBe(false);
    expect(rsvpd.hasHidden).toBe(false);

    const free = marked("s", { rsvps: [] });
    expect(free.hidden("s")).toBe(true);
    expect(free.hasHidden).toBe(true);

    const hosting = scheduleDataFrom(
      {
        ...snapshot,
        sessions: snapshot.sessions.map((s) => ({ ...s, hostIds: ["mia"] })),
        me: {
          ...snapshot.me!,
          rsvps: [],
          marks: [{ sessionId: "s", kind: "hidden" as const }],
        },
      },
      new Date()
    );
    expect(hosting.hidden("s")).toBe(false);
  });

  it("has no viewer without one", () => {
    const data = scheduleDataFrom({ ...snapshot, me: null }, new Date());
    expect(data.guestId).toBeNull();
    expect(data.rsvpd("s")).toBe(false);
    expect(data.availability).toEqual([]);
  });
});
