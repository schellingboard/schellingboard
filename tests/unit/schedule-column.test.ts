import { describe, it, expect } from "vitest";
import { locationColumn } from "@/utils/schedule-column";
import { SLOT_HEIGHT_PX } from "@/utils/grid-layout";
import type { Session } from "@schellingboard/domain/session";
import { newEmptySession } from "@/app/(site)/session_utils";

const at = (hour: number, minute = 0) =>
  new Date(Date.UTC(2026, 9, 1, hour, minute));

const session = (start: Date, end: Date, title = "A session"): Session => ({
  ...newEmptySession("e"),
  id: `${title}-${start.toISOString()}`,
  title,
  startTime: start,
  endTime: end,
});

const day = { start: at(9), end: at(11) };
const px = (minutes: number) => Math.round((minutes / 30) * SLOT_HEIGHT_PX);

const layout = (sessions: Session[], breakMinutes = 10) =>
  locationColumn({ sessions, day, incrementMinutes: 30, breakMinutes });

describe("locationColumn", () => {
  it("draws a session from its start to its end", () => {
    const talk = session(at(9, 40), at(10, 30));
    expect(layout([talk])).toContainEqual({
      kind: "session",
      session: talk,
      topPx: px(40),
      heightPx: px(90) - px(40),
    });
  });

  it("keeps a session that starts off the slot grid", () => {
    const keynote = session(at(9, 5), at(9, 50), "Keynote");
    expect(layout([keynote]).find((item) => item.kind === "session")).toEqual({
      kind: "session",
      session: keynote,
      topPx: px(5),
      heightPx: px(50) - px(5),
    });
  });

  it("keeps a very short session on the grid", () => {
    const blink = session(at(9, 30), at(9, 31), "Blink");
    const item = layout([blink]).find((i) => i.kind === "session");
    expect(item!.heightPx).toBeGreaterThan(px(1));
    expect(item!.topPx + item!.heightPx).toBe(px(31));
  });

  it("offers every slot the room has free once its break is over", () => {
    const frees = layout([session(at(9, 40), at(10, 15))]).filter(
      (item) => item.kind === "free"
    );
    expect(frees.map((f) => f.kind === "free" && f.start)).toEqual([
      at(9),
      at(10, 30),
    ]);
  });

  it("offers a slot that a session runs into only during its break", () => {
    const frees = layout([session(at(9), at(9, 35), "Keynote")]).filter(
      (item) => item.kind === "free"
    );
    expect(frees[0]).toEqual({
      kind: "free",
      start: at(9, 30),
      topPx: px(35),
      heightPx: px(60) - px(35),
    });
  });

  it(
    "offers no slot while the room is unavailable",
    { tags: ["017-US4"] },
    () => {
      const frees = locationColumn({
        sessions: [],
        unavailable: [{ start: at(9, 30), end: at(10, 30) }],
        day,
        incrementMinutes: 30,
        breakMinutes: 10,
      }).filter((item) => item.kind === "free");
      expect(frees.map((f) => f.kind === "free" && f.start)).toEqual([
        at(9),
        at(10, 30),
      ]);
    }
  );

  it("never draws a block above the day", () => {
    const quick = session(at(9), at(9, 5), "Quick");
    const item = layout([quick], 10).find((i) => i.kind === "session");
    expect(item!.topPx).toBe(0);
    expect(item!.heightPx).toBeGreaterThan(0);
  });

  it("lists the column top to bottom", () => {
    const tops = layout([session(at(10, 10), at(10, 30))]).map((i) => i.topPx);
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
  });
});
