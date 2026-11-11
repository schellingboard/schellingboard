import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  estimateAttendanceRange,
  proposalVoteStats,
} from "@schellingboard/domain/proposal-vote-stats";
import { RUNS } from "./property";

const count = fc.integer({ min: 0, max: 400 });
const input = fc.record({
  attendees: fc.integer({ min: 0, max: 600 }),
  eventInterest: fc.record({
    meanInterestShare: fc.double({ min: 0, max: 1, noNaN: true }),
    proposalCount: fc.integer({ min: 0, max: 40 }),
  }),
  interested: count,
  maybe: count,
  skip: count,
});

describe("proposal vote stats (properties)", () => {
  it("keeps every percentage in 0-100 and the estimate a sane range", () => {
    fc.assert(
      fc.property(input, (i) => {
        const stats = proposalVoteStats(i);
        for (const pct of [
          stats.interestedPctOfVotes,
          stats.maybePctOfVotes,
          stats.skipPctOfVotes,
          stats.nonVotersPctOfAttendees,
        ]) {
          if (pct !== null) {
            expect(pct).toBeGreaterThanOrEqual(0);
            expect(pct).toBeLessThanOrEqual(100);
          }
        }
        expect(stats.estimatedAttendance === null).toBe(
          stats.noEstimateReason !== null
        );
        if (stats.estimatedAttendance) {
          const { low, high } = stats.estimatedAttendance;
          expect(low).toBeGreaterThanOrEqual(1);
          expect(low).toBeLessThanOrEqual(high);
          expect(high).toBeLessThanOrEqual(i.attendees);
        }
      }),
      RUNS
    );
  });

  // Attendees are huge so neither the cap nor rounding matters.
  const eventInterest = { meanInterestShare: 0.3, proposalCount: 10 };
  const range = (k: number) =>
    estimateAttendanceRange({
      attendees: 10_000_000,
      eventInterest,
      interested: 3 * k,
      votes: 10 * k,
    });

  it("keeps the midpoint wherever turnout is, and widens the range as turnout falls", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (a, b) => {
          const [few, many] = [Math.min(a, b), Math.max(a, b)];
          const mid = (k: number) => Math.sqrt(range(k).low * range(k).high);
          expect(mid(few) / mid(many)).toBeCloseTo(1, 4);
          if (few < many) {
            const widthRatio = (k: number) => range(k).high / range(k).low;
            expect(widthRatio(few)).toBeGreaterThan(widthRatio(many));
          }
        }
      ),
      RUNS
    );
  });
});
