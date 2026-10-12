import { describe, it, expect } from "vitest";
import {
  rsvpRefusal,
  type RsvpRuleInput,
} from "@schellingboard/domain/rsvp-rule";

const NOW = new Date("2030-01-01T12:00:00.000Z");
const scheduling = {
  schedulingPhaseStart: new Date("2029-12-01T00:00:00.000Z"),
  rsvpCapacityHardLimit: false,
};

const base: RsvpRuleInput = {
  intent: "add",
  event: scheduling,
  now: NOW,
  guestId: "g",
  guestInEvent: true,
  session: { hosts: [{ id: "h", name: "H" }], capacity: 2, numRsvps: 0 },
  alreadyRsvped: false,
};

const refusal = (change: Partial<RsvpRuleInput>) =>
  rsvpRefusal({ ...base, ...change });

describe("rsvpRefusal", () => {
  it(
    "allows a guest of the event to RSVP while scheduling",
    { tags: ["009-US1"] },
    () => {
      expect(refusal({})).toBeUndefined();
    }
  );

  it(
    "refuses a guest who is not part of the event",
    { tags: ["009-US1"] },
    () => {
      expect(refusal({ guestInEvent: false })).toBe("guest.notInEvent");
    }
  );

  it(
    "refuses outside the scheduling phase or without an event",
    { tags: ["009-US1"] },
    () => {
      expect(
        refusal({
          event: {
            ...scheduling,
            schedulingPhaseStart: new Date("2031-01-01T00:00:00.000Z"),
          },
        })
      ).toBe("event.notSchedulingPhase");
      expect(refusal({ event: undefined })).toBe("event.notSchedulingPhase");
      expect(refusal({ intent: "withdraw", event: undefined })).toBe(
        "event.notSchedulingPhase"
      );
    }
  );

  it("checks guest membership before the phase", { tags: ["009-US1"] }, () => {
    expect(refusal({ guestInEvent: false, event: undefined })).toBe(
      "guest.notInEvent"
    );
  });

  it(
    "refuses a host RSVPing to their own session, but not withdrawing",
    { tags: ["009-US1"] },
    () => {
      expect(refusal({ guestId: "h" })).toBe("rsvp.ownSession");
      expect(refusal({ guestId: "h", intent: "withdraw" })).toBeUndefined();
    }
  );

  it(
    "refuses a full session only under a hard limit and a set capacity",
    { tags: ["009-US2"] },
    () => {
      const hard = { ...scheduling, rsvpCapacityHardLimit: true };
      const full = { hosts: [], capacity: 2, numRsvps: 2 };
      expect(refusal({ event: hard, session: full })).toBe("session.full");
      expect(refusal({ session: full })).toBeUndefined();
      expect(
        refusal({ event: hard, session: { ...full, capacity: 0 } })
      ).toBeUndefined();
      expect(
        refusal({ event: hard, session: full, intent: "withdraw" })
      ).toBeUndefined();
    }
  );

  it(
    "lets a guest who already has an RSVP through even on a full session",
    { tags: ["009-US2"] },
    () => {
      const hard = { ...scheduling, rsvpCapacityHardLimit: true };
      expect(
        refusal({
          event: hard,
          session: { hosts: [], capacity: 1, numRsvps: 1 },
          alreadyRsvped: true,
        })
      ).toBeUndefined();
    }
  );
});
