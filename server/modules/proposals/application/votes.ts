import { inVotingPhase } from "@schellingboard/domain/phase";
import type { Vote, VoteChoice } from "@schellingboard/domain/vote";
import { actingAsNamedGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { forbidden, notFound, ok, type Result } from "@/server/kernel/result";
import type { ProposalDeps } from "../ports";

export interface VoteInput {
  proposalId: string;
  guestId: string;
}

const proposalNotFound = () =>
  notFound("proposal.notFound", "Proposal not found");
const outsideVoting = () =>
  forbidden(
    "event.notVotingPhase",
    "Voting is only allowed during the voting phase"
  );

export const castVote =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    { proposalId, guestId, choice }: VoteInput & { choice: VoteChoice },
    now: Date
  ): Promise<Result<void>> => {
    const acting = await actingAsNamedGuest(actor, guestId, repos.guests);
    if (!acting.ok) return acting;
    const proposal = await repos.sessionProposals.findById(proposalId);
    if (!proposal) return proposalNotFound();
    const event = await repos.events.findById(proposal.eventId);
    const eventGuests = event ? await repos.guests.listByEvent(event.id) : [];
    if (!eventGuests.some((g) => g.id === guestId))
      return forbidden("guest.notInEvent", "Guest is not part of this event");
    if (!event || !inVotingPhase(event, now)) return outsideVoting();
    // Atomic upsert: concurrent requests for the same (guest, proposal)
    // cannot produce duplicate votes.
    await repos.votes.upsert({ proposalId, guestId, choice });
    return ok(undefined);
  };

export const withdrawVote =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    { proposalId, guestId }: VoteInput,
    now: Date
  ): Promise<Result<void>> => {
    const acting = await actingAsNamedGuest(actor, guestId, repos.guests);
    if (!acting.ok) return acting;
    const proposal = await repos.sessionProposals.findById(proposalId);
    if (!proposal) return proposalNotFound();
    const event = await repos.events.findById(proposal.eventId);
    if (!event || !inVotingPhase(event, now)) return outsideVoting();
    await repos.votes.deleteByGuestAndProposal(guestId, proposalId);
    return ok(undefined);
  };

export const listGuestVotes =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    {
      guestId,
      event: ref,
    }: { guestId: string; event: { id: string } | { slug: string } }
  ): Promise<Result<Vote[]>> => {
    const acting = await actingAsNamedGuest(actor, guestId, repos.guests);
    if (!acting.ok) return acting;
    const event =
      "id" in ref
        ? await repos.events.findById(ref.id)
        : await repos.events.findBySlug(ref.slug);
    if (!event) return notFound("event.notFound", "Event not found");
    return ok(await repos.votes.listByGuestAndEvent(guestId, event.id));
  };
