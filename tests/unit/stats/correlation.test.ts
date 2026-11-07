import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { ranks, spearman } from "@schellingboard/domain/stats/correlation";

describe("spearman", { tags: ["021-US1"] }, () => {
  it("averages the ranks of ties", () => {
    expect(ranks([10, 20, 20, 30])).toEqual([1, 2.5, 2.5, 4]);
  });

  it("is 1 for a monotone relation and -1 for a reversed one", () => {
    expect(spearman([1, 2, 3, 4], [1, 4, 9, 100]).rho).toBeCloseTo(1, 12);
    expect(spearman([1, 2, 3, 4], [9, 7, 5, 1]).rho).toBeCloseTo(-1, 12);
  });

  it("matches a hand-computed value with ties", () => {
    const { rho, n } = spearman([1, 2, 2, 4, 5], [1, 3, 2, 5, 4]);
    expect(n).toBe(5);
    expect(rho).toBeCloseTo(0.8721, 3);
  });

  it("is undefined without variation or with fewer than 3 pairs", () => {
    expect(spearman([1, 1, 1], [1, 2, 3]).rho).toBeNull();
    expect(spearman([1, 2], [2, 1]).rho).toBeNull();
  });

  it("rejects arrays of different length", () => {
    expect(() => spearman([1, 2, 3], [1, 2])).toThrow();
  });

  it("flags n below 15 as too few to say", () => {
    expect(spearman([1, 2, 3, 4], [1, 2, 3, 5]).tooFew).toBe(true);
    const many = Array.from({ length: 15 }, (_, i) => i);
    expect(spearman(many, many).tooFew).toBe(false);
  });

  it("property: stays within [-1, 1] and is symmetric", () => {
    const pairs = fc.array(
      fc.tuple(
        fc.integer({ min: -50, max: 50 }),
        fc.integer({ min: -50, max: 50 })
      ),
      { minLength: 3, maxLength: 30 }
    );
    fc.assert(
      fc.property(pairs, (list) => {
        const xs = list.map(([x]) => x);
        const ys = list.map(([, y]) => y);
        const a = spearman(xs, ys).rho;
        const b = spearman(ys, xs).rho;
        if (a === null) return expect(b).toBeNull();
        expect(Math.abs(a)).toBeLessThanOrEqual(1 + 1e-9);
        expect(a).toBeCloseTo(b as number, 9);
      })
    );
  });
});
