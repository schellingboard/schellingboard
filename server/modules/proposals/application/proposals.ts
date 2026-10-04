import { STALE_PROPOSAL_MESSAGE } from "@schellingboard/contracts/session";
import { inSchedPhase } from "@schellingboard/domain/phase";
import type { SessionProposal } from "@schellingboard/domain/session";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import {
  conflict,
  forbidden,
  notFound,
  ok,
  type Failure,
  type Result,
} from "@/server/kernel/result";
import type { ProposalDeps } from "../ports";
import {
  presenter,
  presentOne,
  proposalNotFound,
  type ProposalView,
} from "./queries";

export interface ProposalFields {
  title: string;
  description?: string;
  hostIds: string[];
  durationMinutes?: number;
  cohostWanted: boolean;
  cohostWantedNote?: string;
}

export interface CreateProposalInput extends ProposalFields {
  eventId: string;
}

export interface UpdateProposalInput extends ProposalFields {
  proposalId: string;
  expectedUpdatedTime: Date;
}

async function strangerHost(
  repos: ProposalDeps["repos"],
  eventId: string,
  hostIds: string[]
): Promise<Failure | null> {
  const eventGuestIds = new Set(
    (await repos.guests.listByEvent(eventId)).map((g) => g.id)
  );
  return hostIds.every((id) => eventGuestIds.has(id))
    ? null
    : forbidden("proposal.hostNotInEvent", "A host is not part of this event");
}

// A proposal nobody hosts is anyone's to edit or withdraw, in any phase: the
// UI offers both by ownership alone.
async function notItsHost(
  actor: Actor,
  repos: ProposalDeps["repos"],
  proposal: SessionProposal,
  task: "edit" | "delete"
): Promise<Failure | null> {
  if (proposal.hosts.length === 0) return null;
  const acting = await actingGuest(actor, repos.guests);
  if (acting.ok && proposal.hosts.some((h) => h.id === acting.value))
    return null;
  return forbidden(
    "proposal.notHost",
    `Only a host may ${task} this proposal — switch to your name first`
  );
}

export const createProposal =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    { eventId, ...fields }: CreateProposalInput,
    now: Date
  ): Promise<Result<ProposalView>> => {
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const event = await repos.events.findById(eventId);
    if (!event) return notFound("event.notFound", "Event not found");
    if (inSchedPhase(event, now))
      return forbidden("event.proposalsClosed", "The proposal phase is over");
    const stranger = await strangerHost(repos, eventId, fields.hostIds);
    if (stranger) return stranger;

    const created = await repos.sessionProposals.create({
      ...fields,
      hostIds: [...new Set(fields.hostIds)],
      eventId,
      description: fields.description || undefined,
      createdTime: now,
    });
    return ok((await presenter(actor, repos, event, now))(created));
  };

export const updateProposal =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    { proposalId, expectedUpdatedTime, ...fields }: UpdateProposalInput,
    now: Date
  ): Promise<Result<ProposalView>> => {
    const proposal = await repos.sessionProposals.findById(proposalId);
    if (!proposal) return proposalNotFound();
    const refused = await notItsHost(actor, repos, proposal, "edit");
    if (refused) return refused;
    const stranger = await strangerHost(
      repos,
      proposal.eventId,
      fields.hostIds
    );
    if (stranger) return stranger;

    // The repository clears an optional field only when its key is present,
    // so an absent duration or note has to be spelled out to clear it.
    const updated = await repos.sessionProposals.update(proposalId, {
      title: fields.title,
      description: fields.description || undefined,
      hostIds: fields.hostIds,
      durationMinutes: fields.durationMinutes,
      cohostWanted: fields.cohostWanted,
      cohostWantedNote: fields.cohostWantedNote ?? null,
      expectedUpdatedTime,
      updatedTime: now,
    });
    if (!updated) return conflict("proposal.stale", STALE_PROPOSAL_MESSAGE);
    return presentOne(actor, repos, updated, now);
  };

export const joinProposal =
  (deps: ProposalDeps) =>
  async (
    actor: Actor,
    { proposalId }: { proposalId: string },
    now: Date
  ): Promise<Result<void>> => {
    const { repos } = deps;
    const acting = await actingGuest(actor, repos.guests);
    if (!acting.ok) return acting;
    const joinerId = acting.value;
    const proposal = await repos.sessionProposals.findById(proposalId);
    if (!proposal) return proposalNotFound();
    if (proposal.hosts.some((h) => h.id === joinerId))
      return conflict("proposal.alreadyHost", "You already host this proposal");
    const eventGuests = await repos.guests.listByEvent(proposal.eventId);
    if (!eventGuests.some((g) => g.id === joinerId))
      return forbidden("guest.notInEvent", "You are not part of this event");

    // The repository decides whether a host is still wanted, in the same
    // transaction that adds one: two volunteers can click at the same moment.
    if (!(await repos.sessionProposals.addHost(proposalId, joinerId, now)))
      return conflict(
        "proposal.hostNotWanted",
        "This proposal is not looking for a host"
      );
    deps.notifyProposalJoined({ proposalId, joinerId, now });
    return ok(undefined);
  };

export const deleteProposal =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    { proposalId }: { proposalId: string }
  ): Promise<Result<SessionProposal>> => {
    const proposal = await repos.sessionProposals.findById(proposalId);
    if (!proposal) return proposalNotFound();
    const refused = await notItsHost(actor, repos, proposal, "delete");
    if (refused) return refused;
    await repos.sessionProposals.delete(proposalId);
    return ok(proposal);
  };
