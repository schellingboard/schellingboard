import { describe, it, expect } from "vitest";

import { newEmptySession } from "@schellingboard/domain/session";
import type { MeetingView } from "./meeting-view";
import {
  clashMessage,
  clashesAmong,
  describeClash,
  findClashes,
  meetingClashes,
} from "./clashes";

const at = (hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 9, 1, hour, minute));

const session = (id: string, start: Date, end: Date, title = id) => ({
  ...newEmptySession("ev"),
  id,
  title,
  startTime: start,
  endTime: end,
});

function meeting(
  id: string,
  start: Date,
  patch?: Partial<MeetingView>
): MeetingView {
  return {
    id,
    status: "accepted",
    role: "requester",
    otherId: "grace",
    otherName: "Grace",
    slotStart: start.toISOString(),
    slotEnd: new Date(start.getTime() + 30 * 60 * 1000).toISOString(),
    dayLabel: "Thu 1 Oct",
    timeLabel: "10:00 – 10:30",
    meetingPoint: "Coffee bar",
    message: "",
    cancelNote: "",
    clashes: [],
    ...patch,
  };
}

const candidate = session("s", at(10), at(11), "Design Systems");

describe("findClashes", () => {
  it(
    "names an accepted 1-on-1 in the session's slot",
    { tags: ["009-US3"] },
    () => {
      const m = meeting("m", at(10, 30));
      expect(findClashes(candidate, [], [m])).toEqual([
        { kind: "meeting", meeting: m },
      ]);
    }
  );

  it("ignores 1-on-1s that are not confirmed or do not overlap", () => {
    expect(
      findClashes(
        candidate,
        [],
        [
          meeting("pending", at(10), { status: "pending" }),
          meeting("declined", at(10), { status: "declined" }),
          meeting("before", at(9, 30)),
          meeting("after", at(11)),
        ]
      )
    ).toEqual([]);
  });

  it(
    "lists every clash, sessions and 1-on-1s, in start-time order",
    { tags: ["009-US3"] },
    () => {
      const late = session("late", at(10, 45), at(12));
      const early = session("early", at(9), at(10, 15));
      const m = meeting("m", at(10, 20));
      expect(
        findClashes(
          candidate,
          [late, early, session("far", at(13), at(14))],
          [m]
        )
      ).toEqual([
        { kind: "session", session: early },
        { kind: "meeting", meeting: m },
        { kind: "session", session: late },
      ]);
    }
  );

  it("copes with the 1-on-1s not having loaded yet", () => {
    expect(findClashes(candidate, [], null)).toEqual([]);
  });
});

describe("describeClash", () => {
  it("says who the 1-on-1 is with", () => {
    expect(
      describeClash({ kind: "meeting", meeting: meeting("m", at(10)) }, "me")
    ).toBe("your 1-on-1 with Grace");
  });

  it("says whether the viewer hosts or attends the session", () => {
    const hosted = {
      ...session("h", at(10), at(11), "Hosted"),
      hosts: [{ id: "me", name: "Me" }],
    };
    expect(describeClash({ kind: "session", session: hosted }, "me")).toBe(
      '"Hosted", which you are hosting'
    );
    expect(describeClash({ kind: "session", session: candidate }, "me")).toBe(
      '"Design Systems", which you are attending'
    );
  });
});

describe("clashMessage", () => {
  const other = (id: string) => ({
    kind: "session" as const,
    session: session(id, at(10), at(11), id),
  });

  it("names one clash", () => {
    expect(clashMessage([other("A")], "me")).toBe(
      'This session clashes with "A", which you are attending. Do you want to RSVP anyway?'
    );
  });

  it("separates several clashes with semicolons", () => {
    expect(clashMessage([other("A"), other("B"), other("C")], "me")).toBe(
      'This session clashes with "A", which you are attending; "B", which you are attending; "C", which you are attending. Do you want to RSVP anyway?'
    );
  });
});

describe("clashesAmong", { tags: ["007-US11"] }, () => {
  const a = session("a", at(10), at(11));
  const b = session("b", at(10, 30), at(12));
  const c = session("c", at(13), at(14));

  it("maps each overlapping session to what it overlaps, not itself", () => {
    const found = clashesAmong([a, b, c], null);
    expect([...found.keys()]).toEqual(["a", "b"]);
    expect(found.get("a")).toEqual([{ kind: "session", session: b }]);
    expect(found.get("b")).toEqual([{ kind: "session", session: a }]);
  });

  it("includes a session that only meets a confirmed 1-on-1", () => {
    const m = meeting("m", at(13, 30));
    expect([...clashesAmong([c], [m]).keys()]).toEqual(["c"]);
  });

  it("leaves out blockers", () => {
    const blocker = { ...b, blocker: true };
    expect(clashesAmong([a, blocker], null).size).toBe(0);
  });
});

describe("meetingClashes", { tags: ["007-US11"] }, () => {
  it("lists the confirmed 1-on-1s that overlap any of the sessions", () => {
    const hit = meeting("hit", at(10, 15));
    const miss = meeting("miss", at(12));
    const pending = meeting("pending", at(10, 15), { status: "pending" });
    expect(meetingClashes([candidate], [hit, miss, pending])).toEqual(["hit"]);
  });
});
