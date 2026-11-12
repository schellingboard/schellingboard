import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  SLOT_INCREMENT_OPTIONS,
  gridEndingDurations,
  sessionDurationError,
  slotDurationOptions,
  snapDurationToSlots,
} from "@schellingboard/domain/slots";
import { RUNS } from "./property";

const increment = fc.constantFrom(...SLOT_INCREMENT_OPTIONS);
const maxDuration = fc.integer({ min: 0, max: 600 });

describe("slot durations (properties)", () => {
  it("offers at least one whole multiple of the increment, ascending, within the maximum", () => {
    fc.assert(
      fc.property(increment, maxDuration, (inc, max) => {
        const options = slotDurationOptions(inc, max);
        expect(options.length).toBeGreaterThanOrEqual(1);
        expect(options[0]).toBe(inc);
        for (const [i, option] of options.entries()) {
          expect(option % inc).toBe(0);
          if (i > 0) expect(option).toBe(options[i - 1] + inc);
          if (max >= inc) expect(option).toBeLessThanOrEqual(max);
        }
        if (max >= inc) expect(options.at(-1)! + inc).toBeGreaterThan(max);
      }),
      RUNS
    );
  });

  it("snaps to an offered duration, idempotently and monotonically", () => {
    fc.assert(
      fc.property(
        increment,
        maxDuration,
        fc.integer({ min: -100, max: 900 }),
        fc.integer({ min: 0, max: 100 }),
        (inc, max, duration, more) => {
          const options = slotDurationOptions(inc, max);
          const snapped = snapDurationToSlots(duration, inc, max);
          expect(options).toContain(snapped);
          expect(snapDurationToSlots(snapped, inc, max)).toBe(snapped);
          expect(
            snapDurationToSlots(duration + more, inc, max)
          ).toBeGreaterThanOrEqual(snapped);
        }
      ),
      RUNS
    );
  });

  it("only offers durations that end on the grid, within the maximum and past the break", () => {
    fc.assert(
      fc.property(
        increment,
        maxDuration,
        fc.integer({ min: 0, max: 59 }),
        fc.integer({ min: 0, max: 60 }),
        (inc, max, offset, breakMinutes) => {
          const durations = gridEndingDurations({
            slotOffsetMinutes: offset,
            incrementMinutes: inc,
            maxDuration: max,
            breakMinutes,
          });
          if (offset > 0) {
            for (let d = breakMinutes + 1; d <= max; d++) {
              if ((d + offset) % inc === 0) expect(durations).toContain(d);
            }
          }
          for (const d of durations) {
            expect((d + offset) % inc).toBe(0);
            if (offset > 0) {
              expect(d).toBeLessThanOrEqual(max);
              expect(d).toBeGreaterThan(breakMinutes);
            }
          }
        }
      ),
      RUNS
    );
  });

  it("flags a session only when it is longer than the longest option", () => {
    fc.assert(
      fc.property(
        increment,
        maxDuration,
        fc.integer({ min: 0, max: 900 }),
        (inc, max, minutes) => {
          const longest = slotDurationOptions(inc, max).at(-1)!;
          const error = sessionDurationError(
            new Date(0),
            new Date(minutes * 60_000),
            inc,
            max
          );
          expect(error === null).toBe(minutes <= longest);
        }
      ),
      RUNS
    );
  });
});
