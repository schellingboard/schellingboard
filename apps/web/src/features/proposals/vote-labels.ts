import { t } from "@lingui/core/macro";
import { VoteChoice } from "@schellingboard/domain/vote";

export function voteLabel(choice: VoteChoice): string {
  switch (choice) {
    case VoteChoice.interested:
      return t({
        message: "Interested",
        comment: "Vote option on a session proposal",
      });
    case VoteChoice.maybe:
      return t({
        message: "Maybe",
        comment: "Vote option on a session proposal",
      });
    case VoteChoice.skip:
      return t({
        message: "Skip",
        comment: "Vote option on a session proposal: not interested",
      });
  }
}

export function noVoteLabel(): string {
  return t({
    message: "No vote",
    comment: "Shown where the viewer has not voted on a proposal",
  });
}
