import { changes } from "@schellingboard/domain/change";
import { inVotingPhase } from "@schellingboard/domain/phase";
import type { Vote, VoteChoice } from "@schellingboard/domain/vote";
import { actingAsNamedGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { byActor } from "@/server/kernel/change-context";
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
  ({ uow }: ProposalDeps) =>
  async (
    actor: Actor,
    { proposalId, guestId, choice }: VoteInput & { choice: VoteChoice },
    now: Date
  ): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const acting = await actingAsNamedGuest(actor, guestId, tx.guests);
      if (!acting.ok) return acting;
      const proposal = await tx.sessionProposals.findById(proposalId);
      if (!proposal) return proposalNotFound();
      const event = await tx.events.findById(proposal.eventId);
      const eventGuests = event ? await tx.guests.listByEvent(event.id) : [];
      if (!eventGuests.some((g) => g.id === guestId))
        return forbidden("guest.notInEvent", "Guest is not part of this event");
      if (!event || !inVotingPhase(event, now)) return outsideVoting();
      // Atomic upsert: concurrent requests for the same (guest, proposal)
      // cannot produce duplicate votes.
      await tx.votes.upsert({ proposalId, guestId, choice });
      tx.record(
        changes.voteCast(
          { proposalId, guestId, choice },
          proposal.eventId,
          byActor(actor, now)
        )
      );
      return ok(undefined);
    });

export const withdrawVote =
  ({ uow }: ProposalDeps) =>
  async (
    actor: Actor,
    { proposalId, guestId }: VoteInput,
    now: Date
  ): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const acting = await actingAsNamedGuest(actor, guestId, tx.guests);
      if (!acting.ok) return acting;
      const proposal = await tx.sessionProposals.findById(proposalId);
      if (!proposal) return proposalNotFound();
      const event = await tx.events.findById(proposal.eventId);
      if (!event || !inVotingPhase(event, now)) return outsideVoting();
      if (await tx.votes.deleteByGuestAndProposal(guestId, proposalId))
        tx.record(
          changes.voteWithdrawn(
            proposalId,
            guestId,
            proposal.eventId,
            byActor(actor, now)
          )
        );
      return ok(undefined);
    });

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
