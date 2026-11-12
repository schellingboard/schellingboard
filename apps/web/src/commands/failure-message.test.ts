// @module-tag 009-US1
import { describe, expect, it } from "vitest";

import { failureMessage } from "./failure-message";

const subject = "“Intro” (Mon 10:00, Room A)";
const described = {
  failed: `Could not RSVP to ${subject}.`,
  unsure: `Your request to RSVP to ${subject} might not have been saved.`,
};

describe("failureMessage", () => {
  it("names the subject and the reason for a refusal", () => {
    expect(
      failureMessage({ described, code: "session.full", gaveUp: false })
    ).toBe(
      "Could not RSVP to “Intro” (Mon 10:00, Room A). This session is full."
    );
  });

  it("names the proposal and the voting rule", () => {
    expect(
      failureMessage({
        described: {
          failed: "Could not vote on “Rust intro”.",
          unsure: "unused",
        },
        code: "vote.ownProposal",
        gaveUp: false,
      })
    ).toBe(
      "Could not vote on “Rust intro”. Hosts cannot vote on their own proposal."
    );
  });

  it("falls back to a generic reason for a code it does not know", () => {
    expect(failureMessage({ described, code: "http.418", gaveUp: false })).toBe(
      "Could not RSVP to “Intro” (Mon 10:00, Room A). Please try again."
    );
  });

  it("does not claim the connection is at fault when the server gave up", () => {
    expect(
      failureMessage({ described, code: "network.unreachable", gaveUp: true })
    ).not.toContain("connection");
  });

  it("says a given-up command might not have been saved", () => {
    expect(
      failureMessage({ described, code: "network.unreachable", gaveUp: true })
    ).toBe(
      "Your request to RSVP to “Intro” (Mon 10:00, Room A) might not have been saved. Check that it went through, then try again."
    );
  });
});
