import {
  eventInterestSummary,
  proposalVoteStats,
  type ProposalVoteStats,
} from "@schellingboard/domain/proposal-vote-stats";
import type { Event } from "@schellingboard/domain/event";
import { inSchedPhase } from "@schellingboard/domain/phase";
import type { SessionProposal } from "@schellingboard/domain/session";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result } from "@/server/kernel/result";
import type { ProposalDeps } from "../ports";

// Skip votes and the total stay out of the public tally: it reads as interest
// in a proposal rather than as a scoreboard for it.
export interface ProposalView extends Pick<
  SessionProposal,
  | "id"
  | "eventId"
  | "title"
  | "description"
  | "durationMinutes"
  | "createdTime"
  | "updatedTime"
  | "hosts"
  | "cohostWanted"
  | "cohostWantedNote"
  | "sessionIds"
> {
  tally: { interested: number; maybe: number } | null;
  breakdown: ProposalVoteStats | null;
}

export const proposalNotFound = () =>
  notFound("proposal.notFound", "Proposal not found");

const eventNotFound = () => notFound("event.notFound", "Event not found");

// As in the UI, votes stay secret until scheduling; then the breakdown is the
// hosts' business (#370 rule), or everyone's for a proposal nobody hosts.
export async function presenter(
  actor: Actor,
  repos: ProposalDeps["repos"],
  event: Event,
  now: Date,
  known?: SessionProposal[]
): Promise<(p: SessionProposal) => ProposalView> {
  if (!inSchedPhase(event, now))
    return (p) => ({ ...fields(p), tally: null, breakdown: null });
  const [acting, guests, proposals] = await Promise.all([
    actingGuest(actor, repos.guests),
    repos.guests.listByEvent(event.id),
    known ?? repos.sessionProposals.listByEvent(event.id),
  ]);
  const viewerId = acting.ok ? acting.value : null;
  const eventInterest = eventInterestSummary(proposals);
  return (p) => ({
    ...fields(p),
    tally: { interested: p.interestedVotesCount, maybe: p.maybeVotesCount },
    breakdown:
      p.hosts.length === 0 || p.hosts.some((h) => h.id === viewerId)
        ? proposalVoteStats({
            attendees: guests.length,
            eventInterest,
            interested: p.interestedVotesCount,
            maybe: p.maybeVotesCount,
            skip: p.skipVotesCount,
          })
        : null,
  });
}

// The event is missing only if deleted meanwhile, which cascades to the proposal.
export async function presentOne(
  actor: Actor,
  repos: ProposalDeps["repos"],
  proposal: SessionProposal,
  now: Date
): Promise<Result<ProposalView>> {
  const event = await repos.events.findById(proposal.eventId);
  if (!event) return proposalNotFound();
  return ok((await presenter(actor, repos, event, now))(proposal));
}

function fields(p: SessionProposal) {
  return {
    id: p.id,
    eventId: p.eventId,
    title: p.title,
    description: p.description,
    durationMinutes: p.durationMinutes,
    createdTime: p.createdTime,
    updatedTime: p.updatedTime,
    hosts: p.hosts,
    cohostWanted: p.cohostWanted,
    cohostWantedNote: p.cohostWantedNote,
    sessionIds: p.sessionIds,
  };
}

export const getProposal =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    { proposalId }: { proposalId: string },
    now: Date
  ): Promise<Result<ProposalView>> => {
    const proposal = await repos.sessionProposals.findById(proposalId);
    if (!proposal) return proposalNotFound();
    return presentOne(actor, repos, proposal, now);
  };

export const listProposals =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    { eventId }: { eventId: string },
    now: Date
  ): Promise<Result<ProposalView[]>> => {
    const event = await repos.events.findById(eventId);
    if (!event) return eventNotFound();
    const proposals = await repos.sessionProposals.listByEvent(eventId);
    const present = await presenter(actor, repos, event, now, proposals);
    return ok(proposals.map(present));
  };
