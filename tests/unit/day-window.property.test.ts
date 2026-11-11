import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  daysOverlap,
  sessionBookingWindowError,
} from "@schellingboard/domain/day-window";
import {
  SLOT_INCREMENT_OPTIONS,
  isSlotAligned,
} from "@schellingboard/domain/slots";
import type { Day } from "@schellingboard/domain/event";
import { RUNS } from "./property";

const MINUTE = 60_000;
const increment = fc.constantFrom(...SLOT_INCREMENT_OPTIONS);
const at = (base: number, minutes: number) => new Date(base + minutes * MINUTE);

// Offsets are often whole increments, so aligned inputs are common.
const offset = (inc: number) =>
  fc.oneof(
    fc.integer({ min: -4, max: 40 }).map((n) => n * inc),
    fc.integer({ min: -60, max: 600 })
  );

describe("day windows (properties)", () => {
  it("accepts a booking exactly when it is inside the window and on the grid", () => {
    const booking = increment.chain((inc) =>
      fc.record({
        inc: fc.constant(inc),
        base: fc.integer({ min: 0, max: 4_000_000_000_000 }),
        openSlots: fc.integer({ min: 0, max: 5 }),
        windowSlots: fc.integer({ min: 1, max: 30 }),
        startMin: offset(inc),
        endMin: offset(inc),
      })
    );
    fc.assert(
      fc.property(
        booking,
        ({ inc, base, openSlots, windowSlots, startMin, endMin }) => {
          const day = {
            start: at(base, 0),
            end: at(base, (openSlots + windowSlots + 3) * inc),
            startBookings: at(base, openSlots * inc),
            endBookings: at(base, (openSlots + windowSlots) * inc),
          } as Day;
          const start = at(base, startMin);
          const end = at(base, endMin);
          const inside =
            start >= day.startBookings &&
            start < day.endBookings &&
            end <= day.endBookings;
          const aligned =
            isSlotAligned(start, day.start, inc) &&
            isSlotAligned(end, day.start, inc);
          expect(sessionBookingWindowError(day, start, end, inc) === null).toBe(
            inside && aligned
          );
        }
      ),
      RUNS
    );
  });

  it("judges only the endpoints asked about", () => {
    fc.assert(
      fc.property(
        increment,
        fc.integer({ min: 0, max: 4_000_000_000_000 }),
        fc.integer({ min: -600, max: 600 }),
        (inc, base, minutes) => {
          const day = {
            start: at(base, 0),
            end: at(base, 20 * inc),
            startBookings: at(base, 0),
            endBookings: at(base, 10 * inc),
          } as Day;
          const wild = at(base, minutes);
          const fine = at(base, 2 * inc);
          expect(
            sessionBookingWindowError(day, wild, fine, inc, {
              start: false,
              end: true,
            })
          ).toBeNull();
          expect(
            sessionBookingWindowError(day, fine, wild, inc, {
              start: true,
              end: false,
            })
          ).toBeNull();
        }
      ),
      RUNS
    );
  });

  it("overlap is symmetric and means the intervals share time", () => {
    const instant = fc.integer({ min: 0, max: 1000 });
    const length = fc.integer({ min: 1, max: 500 });
    fc.assert(
      fc.property(instant, length, instant, length, (a, aLen, b, bLen) => {
        const [aS, aE, bS, bE] = [a, a + aLen, b, b + bLen].map(
          (n) => new Date(n)
        );
        expect(daysOverlap(aS, aE, bS, bE)).toBe(daysOverlap(bS, bE, aS, aE));
        expect(daysOverlap(aS, aE, bS, bE)).toBe(
          Math.max(a, b) < Math.min(a + aLen, b + bLen)
        );
      }),
      RUNS
    );
  });
});
