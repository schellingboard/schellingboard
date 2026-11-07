import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  backToBackPairs,
  gapsWithin,
  maxConcurrency,
  meanConcurrency,
  mergeIntervals,
  overlapPairs,
  overlappingCounts,
  utilization,
} from "@schellingboard/domain/stats/intervals";

const iv = (start: number, end: number) => ({ start, end });

const intervalArb = fc
  .tuple(fc.integer({ min: 0, max: 1000 }), fc.integer({ min: 1, max: 200 }))
  .map(([start, length]) => iv(start, start + length));

describe("intervals", { tags: ["021-US1"] }, () => {
  it("merges touching and overlapping intervals", () => {
    expect(mergeIntervals([iv(5, 8), iv(0, 3), iv(3, 4), iv(7, 10)])).toEqual([
      iv(0, 4),
      iv(5, 10),
    ]);
  });

  it("finds the free time inside a window", () => {
    expect(
      gapsWithin(iv(0, 100), [iv(10, 30), iv(50, 60), iv(90, 120)])
    ).toEqual([iv(0, 10), iv(30, 50), iv(60, 90)]);
    expect(gapsWithin(iv(0, 10), [])).toEqual([iv(0, 10)]);
  });

  it("measures utilization as the covered share of the window", () => {
    expect(utilization(iv(0, 100), [iv(0, 25), iv(20, 50), iv(-10, 0)])).toBe(
      0.5
    );
    expect(utilization(iv(0, 0), [iv(0, 5)])).toBe(0);
  });

  it("counts the others that overlap each interval", () => {
    expect(
      overlappingCounts([iv(0, 10), iv(5, 15), iv(10, 20), iv(30, 40)])
    ).toEqual([1, 2, 1, 0]);
  });

  it("finds the peak concurrency, touching ends not counting", () => {
    expect(maxConcurrency([iv(0, 10), iv(10, 20), iv(5, 12)])).toBe(2);
    expect(maxConcurrency([])).toBe(0);
  });

  it("counts back-to-back pairs within a gap and overlapping pairs", () => {
    const rsvps = [iv(0, 60), iv(65, 100), iv(200, 260), iv(250, 300)];
    expect(backToBackPairs(rsvps, 10)).toBe(1);
    expect(backToBackPairs(rsvps, 0)).toBe(0);
    expect(overlapPairs(rsvps)).toBe(1);
  });

  it("counts back-to-back pairs across an overlapping RSVP", () => {
    expect(backToBackPairs([iv(0, 60), iv(30, 40), iv(65, 100)], 10)).toBe(1);
  });

  it("property: gaps, utilization, merge and concurrency match a unit-by-unit timeline", () => {
    fc.assert(
      fc.property(fc.array(intervalArb, { maxLength: 15 }), (list) => {
        const window = iv(100, 900);
        const busy = (t: number) => list.some((i) => t >= i.start && t < i.end);
        const units = Array.from({ length: 800 }, (_, k) => 100 + k);
        const gapUnits = units.filter((t) => !busy(t));
        const gaps = gapsWithin(window, list);
        const inGaps = (t: number) =>
          gaps.some((g) => t >= g.start && t < g.end);
        expect(units.filter(inGaps)).toEqual(gapUnits);
        expect(utilization(window, list)).toBeCloseTo(
          1 - gapUnits.length / 800,
          9
        );
        const merged = mergeIntervals(list);
        const coveredAll = Array.from({ length: 1300 }, (_, t) => t).filter(
          busy
        );
        expect(merged.reduce((sum, m) => sum + m.end - m.start, 0)).toBe(
          coveredAll.length
        );
        const peak = Math.max(
          0,
          ...Array.from(
            { length: 1300 },
            (_, t) => list.filter((i) => t >= i.start && t < i.end).length
          )
        );
        expect(maxConcurrency(list)).toBe(peak);
        for (const gap of gaps) expect(gap.end).toBeGreaterThan(gap.start);
      })
    );
  });

  it("property: concurrency is 1 without overlaps and at most the overlap count plus one", () => {
    fc.assert(
      fc.property(
        fc.array(intervalArb, { minLength: 1, maxLength: 12 }),
        (list) => {
          const counts = overlappingCounts(list);
          const peak = maxConcurrency(list);
          expect(peak).toBeLessThanOrEqual(Math.max(...counts) + 1);
          expect(peak === 1).toBe(Math.max(...counts) === 0);
        }
      )
    );
  });

  it("property: merged intervals are sorted and disjoint", () => {
    fc.assert(
      fc.property(fc.array(intervalArb, { maxLength: 15 }), (list) => {
        const merged = mergeIntervals(list);
        merged
          .slice(1)
          .forEach((m, i) => expect(m.start).toBeGreaterThan(merged[i].end));
      })
    );
  });
});

describe("meanConcurrency", { tags: ["021-US4"] }, () => {
  it("averages the sessions running over the booked time", () => {
    expect(meanConcurrency([iv(0, 10), iv(5, 10)])).toBe(1.5);
    expect(meanConcurrency([iv(0, 10), iv(20, 30)])).toBe(1);
  });

  it("ignores intervals that end before they start", () => {
    expect(meanConcurrency([iv(0, 10), iv(8, 2)])).toBe(1);
  });

  it("is null without any booked time", () => {
    expect(meanConcurrency([])).toBeNull();
  });

  it("lies between 1 and the peak", () => {
    fc.assert(
      fc.property(fc.array(intervalArb, { minLength: 1 }), (list) => {
        const mean = meanConcurrency(list)!;
        expect(mean).toBeGreaterThanOrEqual(1 - 1e-9);
        expect(mean).toBeLessThanOrEqual(maxConcurrency(list) + 1e-9);
      })
    );
  });
});
