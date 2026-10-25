// @module-tag 005-US1
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { VoteChoice } from "@schellingboard/domain/vote";
import { describe, expect, it } from "vitest";
import { iso, snapshot as fixture } from "../replica/snapshot-fixture";
import { createReplicaStore } from "../replica/store";
import { fakeApi, problem } from "./fake-api";
import { joinProposal } from "./join-proposal";
import { createCommandRunner } from "./runner";

const wanted = {
  id: "p",
  eventId: "e",
  title: "Rust intro",
  description: null,
  durationMinutes: null,
  createdTime: iso(1),
  updatedTime: iso(1),
  hosts: [{ id: "host", name: "HOST" }],
  cohostWanted: true,
  cohostWantedNote: "Rust fan",
  version: 1,
};

const replica: Snapshot = {
  ...fixture,
  guests: fixture.guests.map((g) => ({ ...g, member: true })),
  proposals: [wanted],
  me: {
    ...fixture.me!,
    guestId: "mia",
    votes: [{ proposalId: "p", choice: VoteChoice.maybe }],
  },
};

function setup(patch: Partial<Snapshot> = {}, status = 204) {
  const { api, calls } = fakeApi(() =>
    status === 204 ? new Response(null, { status }) : problem(status, "x")
  );
  const runner = createCommandRunner({
    store: createReplicaStore({ ...replica, ...patch }),
    api,
    newKey: () => "k",
  });
  return { runner, calls };
}

describe("joining a proposal as a host", () => {
  it("adds the viewer to the hosts at once, and drops their vote", async () => {
    const { runner, calls } = setup();

    const pending = runner.run(joinProposal, { proposalId: "p" });

    const view = runner.view();
    expect(view.proposals[0].hosts.map((h) => h.id)).toEqual(["host", "mia"]);
    expect(view.me?.votes).toEqual([]);
    expect(view.proposals[0]).toMatchObject({
      cohostWanted: false,
      cohostWantedNote: null,
    });
    expect(view.proposals[0].updatedTime).not.toBe(wanted.updatedTime);
    expect(await pending).toEqual({ ok: true, data: undefined });
    expect(calls).toMatchObject([
      { method: "POST", path: "/api/v1/proposals/p/hosts", key: "k" },
    ]);
  });

  it("refuses without sending when no host is wanted", async () => {
    const { runner, calls } = setup({
      proposals: [{ ...wanted, cohostWanted: false }],
    });

    expect(await runner.run(joinProposal, { proposalId: "p" })).toEqual({
      ok: false,
      code: "proposal.hostNotWanted",
    });
    expect(calls).toEqual([]);
  });

  it("refuses a host and a viewer who is not in the event", async () => {
    const host = setup({ me: { ...replica.me!, guestId: "host" } });
    expect(await host.runner.run(joinProposal, { proposalId: "p" })).toEqual({
      ok: false,
      code: "proposal.alreadyHost",
    });

    const outsider = setup({ me: null });
    expect(
      await outsider.runner.run(joinProposal, { proposalId: "p" })
    ).toEqual({ ok: false, code: "guest.notInEvent" });
  });
});
