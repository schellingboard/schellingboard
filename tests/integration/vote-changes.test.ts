// @module-tag 005-US1
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

vi.mock("@/utils/mailer", () => ({ sendMail: vi.fn() }));

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { expectChangesSuffice } from "../helpers/sufficiency";
import { getRepositories } from "@/db/container";
import { proposalUseCases } from "@/server/composition";
import type { Actor } from "@/server/kernel/actor";
import { reaches } from "@schellingboard/domain/change";
import { VoteChoice } from "@schellingboard/domain/vote";
import { snapshotFor } from "@/server/feed/snapshot";
import { unitOfWork } from "@/server/kernel/unit-of-work";

const NOBODY: Actor = { admin: false, guest: null };
const ADMIN: Actor = { admin: true, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "claimed" },
});
const now = () => new Date();

beforeAll(() => setupTestDb());
beforeEach(() => resetTestDb());

async function world() {
  const event = await createEvent({ phase: "voting" });
  const other = await createEvent({ phase: "voting" });
  const host = await createGuest({ name: "Hana Host", eventId: event.id });
  const voter = await createGuest({ name: "Vi Voter", eventId: event.id });
  const bystander = await createGuest({
    name: "Bo Bystander",
    eventId: event.id,
  });
  const proposal = await createProposal(event.id, [host.id], {
    title: "Rust intro",
    cohostWanted: true,
  });
  const second = await createProposal(event.id, [host.id], { title: "Zig" });
  const elsewhere = await createProposal(other.id, [], { title: "Elsewhere" });
  return { event, other, host, voter, bystander, proposal, second, elsewhere };
}

const cast = (
  guestId: string,
  proposalId: string,
  choice = VoteChoice.interested
) =>
  proposalUseCases().castVote(
    open(guestId),
    { proposalId, guestId, choice },
    now()
  );

async function snapshotOf(actor: Actor, slug: string) {
  const result = await snapshotFor(unitOfWork, actor, slug, now());
  if (!result.ok) throw new Error("no snapshot");
  return result.value;
}

describe("the snapshot's own votes", () => {
  it("lists the viewer's votes in this event, and no one else's", async () => {
    const w = await world();
    await cast(w.voter.id, w.proposal.id, VoteChoice.maybe);
    await cast(w.bystander.id, w.proposal.id);
    await getRepositories().votes.create({
      proposalId: w.elsewhere.id,
      guestId: w.voter.id,
      choice: VoteChoice.skip,
    });

    const mine = await snapshotOf(open(w.voter.id), w.event.slug);
    const theirs = await snapshotOf(open(w.bystander.id), w.event.slug);
    const anonymous = await snapshotOf(NOBODY, w.event.slug);

    expect(mine.me?.votes).toEqual([
      { proposalId: w.proposal.id, choice: VoteChoice.maybe },
    ]);
    expect(theirs.me?.votes).toEqual([
      { proposalId: w.proposal.id, choice: VoteChoice.interested },
    ]);
    expect(anonymous.me).toBeNull();
  });
});

describe("the logged changes suffice to keep own votes current", () => {
  it("for a vote cast, changed and withdrawn", async () => {
    const w = await world();
    await expectChangesSuffice(open(w.voter.id), w.event.slug, async () => {
      expect((await cast(w.voter.id, w.proposal.id)).ok).toBe(true);
      expect((await cast(w.voter.id, w.proposal.id, VoteChoice.skip)).ok).toBe(
        true
      );
      const withdrawn = await proposalUseCases().withdrawVote(
        open(w.voter.id),
        { proposalId: w.proposal.id, guestId: w.voter.id },
        now()
      );
      expect(withdrawn.ok).toBe(true);
    });
  });

  it("for a vote lost because the voter joins as host", async () => {
    const w = await world();
    await cast(w.voter.id, w.proposal.id);
    await expectChangesSuffice(open(w.voter.id), w.event.slug, async () => {
      const joined = await proposalUseCases().joinProposal(
        open(w.voter.id),
        { proposalId: w.proposal.id },
        now()
      );
      expect(joined.ok).toBe(true);
    });
  });

  it("for a vote lost because an organizer makes the voter a host", async () => {
    const w = await world();
    await cast(w.voter.id, w.proposal.id);
    await expectChangesSuffice(open(w.voter.id), w.event.slug, async () => {
      const updated = await proposalUseCases().adminUpdateProposal(
        ADMIN,
        {
          id: w.proposal.id,
          title: w.proposal.title,
          description: "",
          durationMinutes: null,
          hostIds: [w.host.id, w.voter.id],
          expectedVersion: w.proposal.version,
        },
        now()
      );
      expect(updated.ok).toBe(true);
    });
  });

  it("for votes lost because the host deletes the proposal", async () => {
    const w = await world();
    await cast(w.voter.id, w.proposal.id);
    await cast(w.voter.id, w.second.id);
    await expectChangesSuffice(open(w.voter.id), w.event.slug, async () => {
      const deleted = await proposalUseCases().deleteProposal(
        open(w.host.id),
        { proposalId: w.proposal.id },
        now()
      );
      expect(deleted.ok).toBe(true);
    });
  });

  it("for votes lost because an organizer deletes the proposal", async () => {
    const w = await world();
    await cast(w.voter.id, w.proposal.id);
    await expectChangesSuffice(open(w.voter.id), w.event.slug, async () => {
      const deleted = await proposalUseCases().adminDeleteProposal(
        ADMIN,
        { id: w.proposal.id },
        now()
      );
      expect(deleted.ok).toBe(true);
    });
  });
});

describe("vote changes in the log", () => {
  it("reach the voter only, and carry no one else", async () => {
    const w = await world();
    const before = (await getRepositories().changes.listAfter(0, 1000)).length;

    await cast(w.voter.id, w.proposal.id);
    await proposalUseCases().withdrawVote(
      open(w.voter.id),
      { proposalId: w.proposal.id, guestId: w.voter.id },
      now()
    );

    const logged = (await getRepositories().changes.listAfter(0, 1000)).slice(
      before
    );
    const votes = logged.filter((c) => c.type.startsWith("vote."));
    expect(votes.map((c) => c.type)).toEqual(["vote.cast", "vote.withdrawn"]);
    for (const change of votes) {
      expect(change.audience).toEqual({ kind: "guests", ids: [w.voter.id] });
      expect(
        reaches(change.audience, { guestId: w.bystander.id, admin: false })
      ).toBe(false);
      expect(reaches(change.audience, { guestId: null, admin: true })).toBe(
        false
      );
    }
  });

  it("never reach another guest's replica", async () => {
    const w = await world();
    await expectChangesSuffice(open(w.bystander.id), w.event.slug, async () => {
      await cast(w.voter.id, w.proposal.id);
      await proposalUseCases().deleteProposal(
        open(w.host.id),
        { proposalId: w.proposal.id },
        now()
      );
    });
  });
});
