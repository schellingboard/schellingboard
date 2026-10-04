import { STALE_PROPOSAL_MESSAGE } from "@schellingboard/contracts/session";
import type { SessionProposal } from "@schellingboard/domain/session";
import type { Actor } from "@/server/kernel/actor";
import {
  conflict,
  forbidden,
  invalid,
  ok,
  type Result,
} from "@/server/kernel/result";
import type { ProposalDeps } from "../ports";
import { presentOne, proposalNotFound, type ProposalView } from "./queries";

export interface AdminUpdateProposalInput {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  hostIds: string[];
  expectedUpdatedTime: string;
}

const adminRequired = () => forbidden("admin.required", "Unauthorized");

export const adminUpdateProposal =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    input: AdminUpdateProposalInput,
    now: Date
  ): Promise<Result<ProposalView>> => {
    if (!actor.admin) return adminRequired();
    const title = input.title.trim();
    if (!title) return invalid("proposal.titleRequired", "Title is required");
    const { durationMinutes } = input;
    if (
      durationMinutes !== null &&
      (!Number.isInteger(durationMinutes) || durationMinutes < 0)
    )
      return invalid(
        "proposal.durationInvalid",
        "Duration must be a non-negative integer"
      );
    const hostIds = [...new Set(input.hostIds.filter(Boolean))];

    const proposal = await repos.sessionProposals.findById(input.id);
    if (!proposal) return proposalNotFound();
    for (const guestId of hostIds) {
      if (!(await repos.guests.findById(guestId)))
        return invalid("proposal.hostUnknown", `Guest not found: ${guestId}`);
    }
    const expectedUpdatedTime = new Date(input.expectedUpdatedTime);
    if (Number.isNaN(expectedUpdatedTime.getTime()))
      return invalid(
        "proposal.expectedUpdatedTimeInvalid",
        "Invalid expectedUpdatedTime"
      );

    const updated = await repos.sessionProposals.update(input.id, {
      title,
      description: input.description.trim(),
      durationMinutes,
      hostIds,
      expectedUpdatedTime,
      updatedTime: now,
    });
    if (!updated) return conflict("proposal.stale", STALE_PROPOSAL_MESSAGE);
    return presentOne(actor, repos, updated, now);
  };

export const adminDeleteProposal =
  ({ repos }: ProposalDeps) =>
  async (
    actor: Actor,
    { id }: { id: string }
  ): Promise<Result<SessionProposal>> => {
    if (!actor.admin) return adminRequired();
    const proposal = await repos.sessionProposals.findById(id);
    if (!proposal) return proposalNotFound();
    await repos.sessionProposals.delete(id);
    return ok(proposal);
  };
