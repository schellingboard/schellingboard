import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  histogram,
  median,
  quantile,
} from "@schellingboard/domain/stats/binning";

describe("binning", { tags: ["021-US1"] }, () => {
  it("counts values into half-open bins, the last one closed", () => {
    expect(histogram([0, 1, 1, 2, 3, 4, 5], [0, 2, 4, 5])).toEqual([
      { from: 0, to: 2, count: 3 },
      { from: 2, to: 4, count: 2 },
      { from: 4, to: 5, count: 2 },
    ]);
  });

  it("drops values outside the edges", () => {
    expect(histogram([-1, 10], [0, 5]).map((b) => b.count)).toEqual([0]);
  });

  it("computes quantiles by linear interpolation", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(quantile([1, 2, 3, 4, 5], 0.75)).toBe(4);
    expect(median([])).toBeNull();
  });

  it("property: every value inside the edges lands in exactly one bin", () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 100 })), (values) => {
        const total = histogram(values, [0, 10, 50, 100]).reduce(
          (s, b) => s + b.count,
          0
        );
        expect(total).toBe(values.length);
      })
    );
  });
});
