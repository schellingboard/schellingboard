import { changes } from "@schellingboard/domain/change";
import type { Vote, VoteChoice } from "@schellingboard/domain/vote";
import {
  voteRefusal,
  type VoteRefusal,
} from "@schellingboard/domain/vote-rule";
import { actingAsNamedGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { byActor } from "@/server/kernel/change-context";
import {
  forbidden,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { Tx } from "@/server/kernel/unit-of-work";
import type { ProposalDeps } from "../ports";

export interface VoteInput {
  proposalId: string;
  guestId: string;
}

const proposalNotFound = () =>
  notFound("proposal.notFound", "Proposal not found");
const REFUSALS: Record<VoteRefusal, () => Failure> = {
  "guest.notInEvent": () =>
    forbidden("guest.notInEvent", "Guest is not part of this event"),
  "event.notVotingPhase": () =>
    forbidden(
      "event.notVotingPhase",
      "Voting is only allowed during the voting phase"
    ),
  "vote.ownProposal": () =>
    forbidden("vote.ownProposal", "Hosts cannot vote on their own proposal"),
};

async function checkVote(
  tx: Tx,
  actor: Actor,
  { proposalId, guestId }: VoteInput,
  intent: "cast" | "withdraw",
  now: Date
) {
  const acting = await actingAsNamedGuest(actor, guestId, tx.guests);
  if (!acting.ok) return acting;
  const proposal = await tx.sessionProposals.findById(proposalId);
  if (!proposal) return proposalNotFound();
  const event = await tx.events.findById(proposal.eventId);
  const eventGuests = event ? await tx.guests.listByEvent(event.id) : [];
  const refusal = voteRefusal({
    intent,
    event,
    now,
    guestId,
    guestInEvent: eventGuests.some((g) => g.id === guestId),
    proposal,
  });
  return refusal ? REFUSALS[refusal]() : ok(proposal);
}

export const castVote =
  ({ uow }: ProposalDeps) =>
  async (
    actor: Actor,
    input: VoteInput & { choice: VoteChoice },
    now: Date
  ): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const checked = await checkVote(tx, actor, input, "cast", now);
      if (!checked.ok) return checked;
      const { proposalId, guestId, choice } = input;
      // Atomic upsert: concurrent requests for the same (guest, proposal)
      // cannot produce duplicate votes.
      await tx.votes.upsert({ proposalId, guestId, choice });
      tx.record(
        changes.voteCast(
          { proposalId, guestId, choice },
          checked.value.eventId,
          byActor(actor, now)
        )
      );
      return ok(undefined);
    });

export const withdrawVote =
  ({ uow }: ProposalDeps) =>
  async (actor: Actor, input: VoteInput, now: Date): Promise<Result<void>> =>
    uow.run(async (tx) => {
      const checked = await checkVote(tx, actor, input, "withdraw", now);
      if (!checked.ok) return checked;
      const { proposalId, guestId } = input;
      if (await tx.votes.deleteByGuestAndProposal(guestId, proposalId))
        tx.record(
          changes.voteWithdrawn(
            proposalId,
            guestId,
            checked.value.eventId,
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
