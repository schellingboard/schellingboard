import type { ProposalDeps } from "../ports";
import { castVote, listGuestVotes, withdrawVote } from "./votes";

export function createProposalUseCases(deps: ProposalDeps) {
  return {
    castVote: castVote(deps),
    withdrawVote: withdrawVote(deps),
    listGuestVotes: listGuestVotes(deps),
  };
}

export type ProposalUseCases = ReturnType<typeof createProposalUseCases>;
