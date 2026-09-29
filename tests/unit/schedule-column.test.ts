import { describe, it, expect } from "vitest";
import { locationColumn } from "@/utils/schedule-column";
import { SLOT_HEIGHT_PX } from "@/utils/slots";
import type { Session } from "@/db/repositories/interfaces";
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
  it("draws a session from its shown start, after the break, to its end", () => {
    const talk = session(at(9, 30), at(10, 30));
    expect(layout([talk])).toContainEqual({
      kind: "session",
      session: talk,
      topPx: px(40),
      heightPx: px(90) - px(40),
    });
  });

  it("draws a blocker over its whole slot", () => {
    const lunch = { ...session(at(9), at(10), "Lunch"), blocker: true };
    expect(layout([lunch])).toContainEqual({
      kind: "session",
      session: lunch,
      topPx: 0,
      heightPx: px(60),
    });
  });

  it("offers every slot nothing occupies, and only those", () => {
    const frees = layout([session(at(9, 30), at(10, 15))]).filter(
      (item) => item.kind === "free"
    );
    expect(frees).toEqual([
      { kind: "free", start: at(9), topPx: 0, heightPx: px(30) },
      { kind: "free", start: at(10, 30), topPx: px(90), heightPx: px(30) },
    ]);
  });

  it("keeps a session that starts off the slot grid", () => {
    const keynote = session(at(9, 5), at(9, 50), "Keynote");
    expect(
      layout([keynote], 0).find((item) => item.kind === "session")
    ).toEqual({
      kind: "session",
      session: keynote,
      topPx: px(5),
      heightPx: px(50) - px(5),
    });
  });

  // The break has no upper bound, so it can swallow a whole session.
  it("keeps a session no longer than the break on the grid", () => {
    const quick = session(at(9), at(9, 10), "Quick");
    const item = layout([quick], 10).find((i) => i.kind === "session");
    expect(item!.heightPx).toBeGreaterThan(0);
    expect(item!.topPx + item!.heightPx).toBe(px(10));
  });

  it("never draws a block above the day", () => {
    const quick = session(at(9), at(9, 5), "Quick");
    const item = layout([quick], 10).find((i) => i.kind === "session");
    expect(item!.topPx).toBe(0);
    expect(item!.heightPx).toBeGreaterThan(0);
  });

  it("lists the column top to bottom", () => {
    const tops = layout([session(at(10), at(10, 30))]).map((i) => i.topPx);
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
  });
});
