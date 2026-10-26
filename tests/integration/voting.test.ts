// @module-tag 005-US1
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { createEvent, createGuest, createProposal } from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { VoteChoice, type Vote } from "@schellingboard/domain/vote";
import { DELETE, GET, PUT } from "@/app/api/v1/[[...route]]/route";
import { apiRequest } from "../helpers/proposal-api";

const votePath = (proposalId: string, guestId: string) =>
  `/proposals/${proposalId}/votes/${guestId}`;

const addVote = (proposalId: string, guestId: string, choice: VoteChoice) =>
  PUT(apiRequest("PUT", votePath(proposalId, guestId), { body: { choice } }));

const deleteVote = (proposalId: string, guestId: string) =>
  DELETE(apiRequest("DELETE", votePath(proposalId, guestId)));

async function votesFor(guestId: string, eventId: string): Promise<Vote[]> {
  const res = await GET(
    apiRequest("GET", `/guests/${guestId}/votes?eventId=${eventId}`)
  );
  expect(res.ok).toBe(true);
  return ((await res.json()) as { votes: Vote[] }).votes;
}

describe("voting through /api/v1", () => {
  beforeAll(() => setupTestDb());
  beforeEach(() => resetTestDb());

  it("a cast vote is listed for the guest", async () => {
    const event = await createEvent({ phase: "voting" });
    const guest = await createGuest({ eventId: event.id });
    const proposal = await createProposal(event.id, []);

    const res = await addVote(proposal.id, guest.id, VoteChoice.interested);
    expect(res.ok).toBe(true);

    const votes = await votesFor(guest.id, event.id);
    expect(votes).toHaveLength(1);
    expect(votes[0]).toMatchObject({
      proposalId: proposal.id,
      choice: VoteChoice.interested,
    });
  });

  it("rejects a voter who is not part of the event", async () => {
    const event = await createEvent({ phase: "voting" });
    const outsider = await createGuest(); // not assigned to the event
    const proposal = await createProposal(event.id, []);

    const res = await addVote(proposal.id, outsider.id, VoteChoice.interested);
    expect(res.status).toBe(403);
    expect(
      await getRepositories().votes.listByGuestAndEvent(outsider.id, event.id)
    ).toHaveLength(0);
  });

  it("repeated votes for the same (guest, proposal) replace instead of duplicating", async () => {
    const event = await createEvent({ phase: "voting" });
    const guest = await createGuest({ eventId: event.id });
    const proposal = await createProposal(event.id, []);

    for (const choice of [
      VoteChoice.interested,
      VoteChoice.maybe,
      VoteChoice.skip,
    ]) {
      expect((await addVote(proposal.id, guest.id, choice)).ok).toBe(true);
    }

    const votes = await votesFor(guest.id, event.id);
    expect(votes).toHaveLength(1);
    expect(votes[0].choice).toBe(VoteChoice.skip);
  });

  it("database rejects duplicate votes for the same (guest, proposal)", async () => {
    const event = await createEvent({ phase: "voting" });
    const guest = await createGuest({ eventId: event.id });
    const proposal = await createProposal(event.id, []);
    const repos = getRepositories();

    await repos.votes.create({
      proposalId: proposal.id,
      guestId: guest.id,
      choice: VoteChoice.interested,
    });
    await expect(
      repos.votes.create({
        proposalId: proposal.id,
        guestId: guest.id,
        choice: VoteChoice.maybe,
      })
    ).rejects.toThrow(/unique/i);
  });

  it("upsert atomically replaces an existing vote", async () => {
    const event = await createEvent({ phase: "voting" });
    const guest = await createGuest({ eventId: event.id });
    const proposal = await createProposal(event.id, []);
    const repos = getRepositories();

    await repos.votes.upsert({
      proposalId: proposal.id,
      guestId: guest.id,
      choice: VoteChoice.interested,
    });
    await repos.votes.upsert({
      proposalId: proposal.id,
      guestId: guest.id,
      choice: VoteChoice.maybe,
    });

    const votes = await votesFor(guest.id, event.id);
    expect(votes).toHaveLength(1);
    expect(votes[0].choice).toBe(VoteChoice.maybe);
  });

  it("withdrawing removes only the withdrawing guest's vote", async () => {
    const event = await createEvent({ phase: "voting" });
    const alice = await createGuest({ name: "Alice", eventId: event.id });
    const bob = await createGuest({ name: "Bob", eventId: event.id });
    const proposal = await createProposal(event.id, []);

    for (const guest of [alice, bob]) {
      await addVote(proposal.id, guest.id, VoteChoice.interested);
    }

    expect((await deleteVote(proposal.id, alice.id)).ok).toBe(true);

    expect(await votesFor(alice.id, event.id)).toHaveLength(0);
    expect(await votesFor(bob.id, event.id)).toHaveLength(1);
  });

  it("withdrawing is rejected outside the voting phase", async () => {
    const event = await createEvent({ phase: "voting" });
    const guest = await createGuest({ eventId: event.id });
    const proposal = await createProposal(event.id, []);
    await addVote(proposal.id, guest.id, VoteChoice.interested);

    const now = new Date();
    const DAY_MS = 24 * 60 * 60 * 1000;
    await getRepositories().events.update(event.id, {
      votingPhaseStart: new Date(now.getTime() - 14 * DAY_MS),
      votingPhaseEnd: new Date(now.getTime() - 7 * DAY_MS),
      schedulingPhaseStart: new Date(now.getTime() - 7 * DAY_MS),
      schedulingPhaseEnd: new Date(now.getTime() + 7 * DAY_MS),
    });

    const res = await deleteVote(proposal.id, guest.id);
    expect(res.status).toBe(403);
    expect(await votesFor(guest.id, event.id)).toHaveLength(1);
  });

  it("withdrawing answers 404 for a missing proposal", async () => {
    const orphan = await createGuest();
    const res = await deleteVote("does-not-exist", orphan.id);
    expect(res.status).toBe(404);
  });

  it("lists votes scoped to the given guest and event", async () => {
    const eventA = await createEvent({ name: "Event A", phase: "voting" });
    const eventB = await createEvent({ name: "Event B", phase: "voting" });
    const guest = await createGuest({ eventId: eventA.id });
    await getRepositories().guests.assignToEvent(eventB.id, [guest.id]);
    const proposalA = await createProposal(eventA.id, []);
    const proposalB = await createProposal(eventB.id, []);

    await addVote(proposalA.id, guest.id, VoteChoice.interested);
    await addVote(proposalB.id, guest.id, VoteChoice.maybe);

    const votesA = await votesFor(guest.id, eventA.id);
    expect(votesA).toHaveLength(1);
    expect(votesA[0].proposalId).toBe(proposalA.id);
  });

  it("proposal tallies reflect mixed interested/maybe/skip votes", async () => {
    const event = await createEvent({ name: "Vote Event", phase: "voting" });
    const guests = await Promise.all([
      createGuest({ name: "G1", eventId: event.id }),
      createGuest({ name: "G2", eventId: event.id }),
      createGuest({ name: "G3", eventId: event.id }),
      createGuest({ name: "G4", eventId: event.id }),
    ]);
    const proposal = await createProposal(event.id, []);
    const other = await createProposal(event.id, []);

    const choices = [
      VoteChoice.interested,
      VoteChoice.interested,
      VoteChoice.maybe,
      VoteChoice.skip,
    ];
    for (let i = 0; i < guests.length; i++) {
      await addVote(proposal.id, guests[i].id, choices[i]);
    }

    const proposals = await getRepositories().sessionProposals.listByEvent(
      event.id
    );
    const tallied = proposals.find((p) => p.id === proposal.id)!;
    // votesCount counts every vote, including skips
    expect(tallied.votesCount).toBe(4);
    expect(tallied.interestedVotesCount).toBe(2);
    expect(tallied.maybeVotesCount).toBe(1);
    expect(tallied.skipVotesCount).toBe(1);

    const untouched = proposals.find((p) => p.id === other.id)!;
    expect(untouched.votesCount).toBe(0);
  });
});
