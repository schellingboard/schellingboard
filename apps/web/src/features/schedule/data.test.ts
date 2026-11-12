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

  describe("clashes", { tags: ["007-US11"] }, () => {
    const other = { ...snapshot.sessions[0], id: "o", hostIds: [] };
    const make = (
      marks: { sessionId: string; kind: "bookmark" }[],
      rsvps: string[]
    ) =>
      scheduleDataFrom(
        {
          ...snapshot,
          sessions: [snapshot.sessions[0], other],
          me: {
            ...snapshot.me!,
            marks,
            rsvps: rsvps.map((sessionId) => ({
              id: sessionId,
              sessionId,
              guestId: "mia",
            })),
          },
        },
        new Date()
      );

    it("marks two RSVP'd sessions that overlap, with the clash named", () => {
      const data = make([], ["s", "o"]);
      expect(data.hasClashes).toBe(true);
      expect(data.clashes("s").map((c) => c.kind)).toEqual(["session"]);
      expect(data.clashing("s")).toBe(true);
    });

    it("counts a bookmark for the chip but never for the icon", () => {
      const data = make([{ sessionId: "o", kind: "bookmark" }], ["s"]);
      expect(data.hasClashes).toBe(true);
      expect(data.clashing("o")).toBe(true);
      expect(data.clashes("s")).toEqual([]);
      expect(data.clashes("o")).toEqual([]);
    });

    it("has none without a second commitment", () => {
      const data = make([], ["s"]);
      expect(data.hasClashes).toBe(false);
      expect(data.clashing("s")).toBe(false);
    });
  });

  it("has no viewer without one", () => {
    const data = scheduleDataFrom({ ...snapshot, me: null }, new Date());
    expect(data.guestId).toBeNull();
    expect(data.rsvpd("s")).toBe(false);
    expect(data.availability).toEqual([]);
  });
});
