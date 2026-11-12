import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  meetingRun,
  meetingSlotsForDay,
} from "@schellingboard/domain/meeting-slots";
import { SLOT_INCREMENT_OPTIONS } from "@schellingboard/domain/slots";
import { RUNS } from "./property";

const MINUTE = 60_000;
const increment = fc.constantFrom(...SLOT_INCREMENT_OPTIONS);
const day = fc
  .tuple(
    fc.integer({ min: 0, max: 4_000_000_000_000 }),
    fc.integer({ min: 0, max: 3000 })
  )
  .map(([start, minutes]) => ({
    start: new Date(start),
    end: new Date(start + minutes * MINUTE),
  }));

describe("meeting slots (properties)", () => {
  it("are contiguous, whole, inside the day and as many as fit", () => {
    fc.assert(
      fc.property(day, increment, (d, inc) => {
        const slots = meetingSlotsForDay(d, inc);
        const step = inc * MINUTE;
        expect(slots).toHaveLength(
          Math.floor((d.end.getTime() - d.start.getTime()) / step)
        );
        for (const [i, slot] of slots.entries()) {
          expect(slot.end.getTime() - slot.start.getTime()).toBe(step);
          expect(slot.start.getTime()).toBe(d.start.getTime() + i * step);
          expect(slot.end.getTime()).toBeLessThanOrEqual(d.end.getTime());
        }
      }),
      RUNS
    );
  });

  it("a run is the next slots from its start, or null when the day ends first or the start is no slot", () => {
    fc.assert(
      fc.property(
        day,
        increment,
        fc.integer({ min: 0, max: 80 }),
        fc.integer({ min: 1, max: 8 }),
        fc.integer({ min: 1, max: 14 }),
        (d, inc, index, count, strayMinutes) => {
          const slots = meetingSlotsForDay(d, inc);
          const start = new Date(d.start.getTime() + index * inc * MINUTE);
          const run = meetingRun(slots, start, count);
          if (index + count > slots.length) {
            expect(run).toBeNull();
          } else {
            expect(run).toEqual(slots.slice(index, index + count));
          }
          const stray = new Date(
            d.start.getTime() +
              (index * inc + (strayMinutes % inc || 1)) * MINUTE
          );
          expect(meetingRun(slots, stray, count)).toBeNull();
        }
      ),
      RUNS
    );
  });
});
