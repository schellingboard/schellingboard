import type {
  proposalViewSchema,
  snapshotProposalSchema,
} from "@schellingboard/contracts/proposal";
import type { LoggedProposal } from "@schellingboard/domain/change";
import type { z } from "zod";
import type { ProposalView } from "../application/queries";

export function toSnapshotProposalView(
  p: LoggedProposal
): z.input<typeof snapshotProposalSchema> {
  return {
    id: p.id,
    eventId: p.eventId,
    title: p.title,
    description: p.description ?? null,
    durationMinutes: p.durationMinutes ?? null,
    createdTime: p.createdTime.toISOString(),
    updatedTime: p.updatedTime.toISOString(),
    hosts: p.hosts.map(({ id, name }) => ({ id, name })),
    cohostWanted: p.cohostWanted,
    cohostWantedNote: p.cohostWantedNote ?? null,
    version: p.version,
  };
}

export function toProposalView(
  p: ProposalView
): z.input<typeof proposalViewSchema> {
  return {
    id: p.id,
    eventId: p.eventId,
    title: p.title,
    description: p.description ?? null,
    durationMinutes: p.durationMinutes ?? null,
    createdTime: p.createdTime.toISOString(),
    updatedTime: p.updatedTime.toISOString(),
    hosts: p.hosts.map(({ id, name }) => ({ id, name })),
    cohostWanted: p.cohostWanted,
    cohostWantedNote: p.cohostWantedNote ?? null,
    sessionIds: p.sessionIds,
    tally: p.tally,
    votesCount: p.votesCount,
    breakdown: p.breakdown,
    version: p.version,
  };
}
