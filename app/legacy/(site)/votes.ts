import { VoteChoice } from "@schellingboard/domain/vote";
import type { SessionProposal } from "@schellingboard/domain/session";

export {
  VOTE_CHOICES,
  NO_VOTE_LABEL,
  voteChoiceToEmoji,
  voteChoiceToLabel,
  voteChoiceRank,
} from "@schellingboard/domain/vote-display";

export type ProposalVoteCounts = Pick<
  SessionProposal,
  "interestedVotesCount" | "maybeVotesCount" | "skipVotesCount"
>;

const COUNT_FIELD: Record<VoteChoice, keyof ProposalVoteCounts> = {
  [VoteChoice.interested]: "interestedVotesCount",
  [VoteChoice.maybe]: "maybeVotesCount",
  [VoteChoice.skip]: "skipVotesCount",
};

export function voteCount(
  counts: ProposalVoteCounts,
  choice: VoteChoice
): number {
  return counts[COUNT_FIELD[choice]];
}
