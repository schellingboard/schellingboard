// @module-tag 007-US4
import { describe, it, expect } from "vitest";
import {
  getNowOffsetPx,
  gridBlockPx,
  nowScrollTop,
  SLOT_HEIGHT_PX,
} from "./grid-layout";

const day = {
  start: new Date("2026-06-15T08:00:00Z"),
  end: new Date("2026-06-15T18:00:00Z"),
};

describe("getNowOffsetPx", () => {
  it("is the share of a slot already gone, in pixels", () => {
    const now = new Date("2026-06-15T09:15:00Z");
    expect(getNowOffsetPx(day, now, 30)).toBe(SLOT_HEIGHT_PX * 2.5);
  });

  it("is null outside the day, the end being outside", () => {
    expect(
      getNowOffsetPx(day, new Date("2026-06-15T07:59:00Z"), 30)
    ).toBeNull();
    expect(getNowOffsetPx(day, day.end, 30)).toBeNull();
  });
});

describe("gridBlockPx", () => {
  it("places a block by the minute", () => {
    expect(
      gridBlockPx(
        day.start,
        new Date("2026-06-15T09:00:00Z"),
        new Date("2026-06-15T10:00:00Z"),
        30
      )
    ).toEqual({ topPx: SLOT_HEIGHT_PX * 2, heightPx: SLOT_HEIGHT_PX * 2 });
  });
});

describe("nowScrollTop", () => {
  it("puts the line a third from the top of the container", () => {
    expect(
      nowScrollTop({
        scrollTop: 100,
        containerTop: 64,
        lineTop: 664,
        clientHeight: 600,
      })
    ).toBe(100 + 600 - 200);
  });
});
