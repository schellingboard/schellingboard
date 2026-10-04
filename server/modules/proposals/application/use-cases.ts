import type { ProposalDeps } from "../ports";
import {
  adminCreateProposal,
  adminDeleteProposal,
  adminUpdateProposal,
} from "./admin-proposals";
import {
  createProposal,
  deleteProposal,
  joinProposal,
  updateProposal,
} from "./proposals";
import { getProposal, listProposals } from "./queries";
import { castVote, listGuestVotes, withdrawVote } from "./votes";

export function createProposalUseCases(deps: ProposalDeps) {
  return {
    getProposal: getProposal(deps),
    listProposals: listProposals(deps),
    createProposal: createProposal(deps),
    updateProposal: updateProposal(deps),
    joinProposal: joinProposal(deps),
    deleteProposal: deleteProposal(deps),
    adminCreateProposal: adminCreateProposal(deps),
    adminUpdateProposal: adminUpdateProposal(deps),
    adminDeleteProposal: adminDeleteProposal(deps),
    castVote: castVote(deps),
    withdrawVote: withdrawVote(deps),
    listGuestVotes: listGuestVotes(deps),
  };
}

export type ProposalUseCases = ReturnType<typeof createProposalUseCases>;
