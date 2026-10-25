// @module-tag 005-US1
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { VoteChoice } from "@schellingboard/domain/vote";
import { describe, expect, it } from "vitest";
import { iso, snapshot as fixture } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { fakeApi } from "./fake-api";
import { createCommandRunner } from "./runner";
import { castVote, withdrawVote } from "./vote";

const proposal = {
  id: "p",
  eventId: "e",
  title: "Rust intro",
  description: null,
  durationMinutes: null,
  createdTime: iso(1),
  updatedTime: iso(1),
  hosts: [{ id: "host", name: "HOST" }],
  cohostWanted: false,
  cohostWantedNote: null,
  version: 1,
};

const voting: Snapshot = {
  ...fixture,
  now: iso(10),
  event: {
    ...fixture.event,
    votingPhaseStart: iso(0),
    votingPhaseEnd: iso(20),
    schedulingPhaseStart: iso(20),
  },
  guests: fixture.guests.map((g) => ({ ...g, member: true })),
  proposals: [proposal],
  me: { ...fixture.me!, votes: [] },
};

function setup(replica: Snapshot, status = 204) {
  const { api, calls } = fakeApi(() => new Response(null, { status }));
  const store = createReplicaStore(replica);
  const runner = createCommandRunner({ store, api, newKey: () => "k" });
  return { runner, store, calls };
}

describe("vote commands", () => {
  it("cast the choice at once and send it", async () => {
    const { runner, calls } = setup(voting);

    const pending = runner.run(castVote, {
      proposalId: "p",
      choice: VoteChoice.interested,
    });

    expect(runner.view().me?.votes).toEqual([
      { proposalId: "p", choice: VoteChoice.interested },
    ]);
    expect(await pending).toEqual({ ok: true, data: undefined });
    expect(calls).toMatchObject([
      {
        method: "PUT",
        path: "/api/v1/proposals/p/votes/mia",
        key: "k",
        body: { choice: "interested" },
      },
    ]);
  });

  it("change a vote in place", async () => {
    const { runner } = setup({
      ...voting,
      me: {
        ...voting.me!,
        votes: [{ proposalId: "p", choice: VoteChoice.skip }],
      },
    });

    await runner.run(castVote, { proposalId: "p", choice: VoteChoice.maybe });

    expect(runner.view().me?.votes).toEqual([
      { proposalId: "p", choice: VoteChoice.maybe },
    ]);
  });

  it("withdraw a vote and send the delete", async () => {
    const { runner, calls } = setup({
      ...voting,
      me: {
        ...voting.me!,
        votes: [{ proposalId: "p", choice: VoteChoice.skip }],
      },
    });

    await runner.run(withdrawVote, { proposalId: "p" });

    expect(runner.view().me?.votes).toEqual([]);
    expect(calls).toMatchObject([
      { method: "DELETE", path: "/api/v1/proposals/p/votes/mia" },
    ]);
  });

  it("are refused locally by the domain rule, sending nothing", async () => {
    const own = setup({ ...voting, me: { ...voting.me!, guestId: "host" } });

    expect(
      await own.runner.run(castVote, {
        proposalId: "p",
        choice: VoteChoice.skip,
      })
    ).toEqual({ ok: false, code: "vote.ownProposal" });
    expect(own.calls).toEqual([]);
  });

  it("are refused for an unknown proposal or a signed-out viewer", async () => {
    const unknown = setup(voting);
    const signedOut = setup({ ...voting, me: null });

    expect(
      await unknown.runner.run(withdrawVote, { proposalId: "gone" })
    ).toEqual({ ok: false, code: "proposal.notFound" });
    expect(
      await signedOut.runner.run(withdrawVote, { proposalId: "p" })
    ).toEqual({ ok: false, code: "guest.notInEvent" });
  });

  it("describe the proposal by title", () => {
    expect(
      castVote.describe(voting, { proposalId: "p", choice: VoteChoice.skip })
    ).toBe("vote on “Rust intro”");
    expect(withdrawVote.describe(voting, { proposalId: "p" })).toBe(
      "withdraw your vote on “Rust intro”"
    );
  });
});
