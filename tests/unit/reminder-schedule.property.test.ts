import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  followUpDueTime,
  followUpEligible,
  headsUpDueTime,
  headsUpEligible,
} from "@schellingboard/domain/reminder-schedule";
import { RUNS } from "./property";

const HOUR = 3_600_000;
const instant = fc
  .integer({ min: 0, max: 10_000 * HOUR })
  .map((n) => new Date(n));
const length = fc.integer({ min: 1, max: 6 * HOUR });
const maybe = fc.option(instant, { nil: null });

describe("reminder eligibility (properties)", () => {
  it("never sends a heads-up before it is due or once the session is over", () => {
    fc.assert(
      fc.property(
        instant,
        instant,
        length,
        maybe,
        maybe,
        fc.boolean(),
        fc.boolean(),
        fc.constantFrom(null, -1, 0, 1),
        fc.constantFrom("due", "end"),
        (
          random,
          start,
          len,
          randomDue,
          storedClaimedAt,
          notified,
          useDue,
          nudge,
          edge
        ) => {
          const end = new Date(start.getTime() + len);
          const storedDueTime = useDue ? headsUpDueTime(start) : randomDue;
          // Exact boundaries are where an off-by-one hides.
          const anchor = edge === "due" ? headsUpDueTime(start) : end;
          const now =
            nudge === null ? random : new Date(anchor.getTime() + nudge);
          const eligible = headsUpEligible({
            now,
            startTime: start,
            endTime: end,
            storedDueTime,
            storedClaimedAt,
            alreadyNotifiedHost: notified,
          });
          if (now < headsUpDueTime(start) || now >= end) {
            expect(eligible).toBe(false);
          }
          if (now >= headsUpDueTime(start) && now < end) {
            if (!notified) expect(eligible).toBe(true);
            else if (useDue) expect(eligible).toBe(storedClaimedAt === null);
            else {
              const sentAgo = start.getTime() - (storedDueTime?.getTime() ?? 0);
              expect(eligible).toBe(sentAgo > 90 * 60_000);
            }
          }
        }
      ),
      RUNS
    );
  });

  it("a heads-up's answer does not change while the session runs its window", () => {
    fc.assert(
      fc.property(
        instant,
        length,
        maybe,
        maybe,
        fc.boolean(),
        fc.boolean(),
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (start, len, randomDue, storedClaimedAt, notified, useDue, f1, f2) => {
          const end = new Date(start.getTime() + len);
          const storedDueTime = useDue ? headsUpDueTime(start) : randomDue;
          const due = headsUpDueTime(start).getTime();
          const span = end.getTime() - due - 1;
          const at = (f: number) => new Date(due + Math.floor(f * span));
          const ask = (now: Date) =>
            headsUpEligible({
              now,
              startTime: start,
              endTime: end,
              storedDueTime,
              storedClaimedAt,
              alreadyNotifiedHost: notified,
            });
          expect(ask(at(f1))).toBe(ask(at(f2)));
        }
      ),
      RUNS
    );
  });

  it("never asks for a count that is already recorded, and once due stays eligible", () => {
    fc.assert(
      fc.property(
        instant,
        instant,
        fc.integer({ min: 0, max: 100 * HOUR }),
        fc.boolean(),
        maybe,
        maybe,
        fc.boolean(),
        (now, end, later, recorded, randomDue, storedClaimedAt, useDue) => {
          const storedDueTime = useDue ? followUpDueTime(end) : randomDue;
          const ask = (at: Date, hasRecordedCount: boolean) =>
            followUpEligible({
              now: at,
              endTime: end,
              hasRecordedCount,
              storedDueTime,
              storedClaimedAt,
            });
          expect(ask(now, true)).toBe(false);
          if (!recorded && now >= followUpDueTime(end)) {
            expect(ask(now, false)).toBe(!(useDue && storedClaimedAt !== null));
          }
          if (!recorded && ask(now, false)) {
            expect(ask(new Date(now.getTime() + later), false)).toBe(true);
          }
          if (now < followUpDueTime(end)) expect(ask(now, false)).toBe(false);
        }
      ),
      RUNS
    );
  });
});
