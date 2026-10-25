import { describe, it, expect } from "vitest";
import {
  voteRefusal,
  type VoteRuleInput,
} from "@schellingboard/domain/vote-rule";

const NOW = new Date("2030-01-01T12:00:00.000Z");
const voting = {
  votingPhaseStart: new Date("2029-12-01T00:00:00.000Z"),
  votingPhaseEnd: new Date("2030-02-01T00:00:00.000Z"),
  schedulingPhaseStart: new Date("2030-02-01T00:00:00.000Z"),
};

const base: VoteRuleInput = {
  intent: "cast",
  event: voting,
  now: NOW,
  guestId: "g",
  guestInEvent: true,
  proposal: { hosts: [{ id: "h", name: "H" }] },
};

const refusal = (change: Partial<VoteRuleInput>) =>
  voteRefusal({ ...base, ...change });

describe("voteRefusal", () => {
  it(
    "allows a guest of the event to vote while voting",
    { tags: ["005-US1"] },
    () => {
      expect(refusal({})).toBeUndefined();
    }
  );

  it(
    "refuses a guest who is not part of the event",
    { tags: ["005-US1"] },
    () => {
      expect(refusal({ guestInEvent: false })).toBe("guest.notInEvent");
      expect(
        refusal({ guestInEvent: false, intent: "withdraw" })
      ).toBeUndefined();
    }
  );

  it(
    "refuses outside the voting phase or without an event",
    { tags: ["005-US1"] },
    () => {
      expect(
        refusal({
          event: {
            ...voting,
            votingPhaseStart: new Date("2031-01-01T00:00:00.000Z"),
          },
        })
      ).toBe("event.notVotingPhase");
      expect(refusal({ event: undefined })).toBe("event.notVotingPhase");
      expect(refusal({ intent: "withdraw", event: undefined })).toBe(
        "event.notVotingPhase"
      );
    }
  );

  it(
    "refuses a host voting on their own proposal, but not withdrawing",
    { tags: ["005-US1"] },
    () => {
      expect(refusal({ guestId: "h" })).toBe("vote.ownProposal");
      expect(refusal({ guestId: "h", intent: "withdraw" })).toBeUndefined();
    }
  );
});
