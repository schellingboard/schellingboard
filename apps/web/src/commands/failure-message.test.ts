// @module-tag 009-US1
import { describe, expect, it } from "vitest";
import { failureMessage } from "./failure-message";

const what = "RSVP to “Intro” (Mon 10:00, Room A)";

describe("failureMessage", () => {
  it("names the subject and the reason for a refusal", () => {
    expect(failureMessage({ what, code: "session.full", gaveUp: false })).toBe(
      "Could not RSVP to “Intro” (Mon 10:00, Room A). This session is full."
    );
  });

  it("names the proposal and the voting rule", () => {
    expect(
      failureMessage({
        what: "vote on “Rust intro”",
        code: "vote.ownProposal",
        gaveUp: false,
      })
    ).toBe(
      "Could not vote on “Rust intro”. Hosts cannot vote on their own proposal."
    );
  });

  it("falls back to a generic reason for a code it does not know", () => {
    expect(failureMessage({ what, code: "http.418", gaveUp: false })).toBe(
      "Could not RSVP to “Intro” (Mon 10:00, Room A). Please try again."
    );
  });

  it("does not claim the connection is at fault when the server gave up", () => {
    expect(
      failureMessage({ what, code: "network.unreachable", gaveUp: true })
    ).not.toContain("connection");
  });

  it("says a given-up command might not have been saved", () => {
    expect(
      failureMessage({ what, code: "network.unreachable", gaveUp: true })
    ).toBe(
      "Your request to RSVP to “Intro” (Mon 10:00, Room A) might not have been saved. Check that it went through, then try again."
    );
  });
});
