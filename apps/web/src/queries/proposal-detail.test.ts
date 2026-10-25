// @module-tag 005-US1
import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createProposalDetailQuery } from "./proposal-detail";

const breakdown = {
  attendees: 10,
  interested: 2,
  maybe: 1,
  skip: 1,
  votes: 4,
  votesPctOfAttendees: 40,
  nonVoters: 6,
  nonVotersPctOfAttendees: 60,
  interestedPctOfVotes: 50,
  maybePctOfVotes: 25,
  skipPctOfVotes: 25,
  estimatedAttendance: null,
  noEstimateReason: "low-turnout",
};

describe("the proposal detail", () => {
  it("reads the tally and the breakdown the viewer may see", async () => {
    const { api, calls } = fakeApi(() =>
      Response.json({ id: "p", tally: { interested: 2, maybe: 1 }, breakdown })
    );
    const query = createProposalDetailQuery({ api, proposalId: "p" });

    await query.refresh();

    expect(calls.map((c) => c.path)).toEqual(["/api/v1/proposals/p"]);
    expect(query.get()).toEqual({
      status: "ready",
      tally: { interested: 2, maybe: 1 },
      breakdown,
    });
  });

  it("keeps what it had and reports a failure", async () => {
    let fail = false;
    const { api } = fakeApi(() =>
      fail
        ? problem(500, "server.error")
        : Response.json({ id: "p", tally: null, breakdown: null })
    );
    const query = createProposalDetailQuery({ api, proposalId: "p" });
    await query.refresh();

    fail = true;
    await query.refresh();

    expect(query.get()).toMatchObject({
      status: "error",
      code: "server.error",
      tally: null,
      breakdown: null,
    });
  });

  it("ignores an answer that arrives after destroy", async () => {
    const { api } = fakeApi(() =>
      Response.json({ id: "p", tally: null, breakdown: null })
    );
    const query = createProposalDetailQuery({ api, proposalId: "p" });
    const loading = query.refresh();
    query.destroy();
    await loading;
    expect(query.get().status).toBe("loading");
  });
});
