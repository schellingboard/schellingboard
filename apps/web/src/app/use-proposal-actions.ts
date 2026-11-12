import { useCallback, useMemo } from "react";
import type { VoteChoice } from "@schellingboard/domain/vote";
import { joinProposal } from "../commands/join-proposal";
import { castVote, withdrawVote } from "../commands/vote";
import type { ProposalActions } from "../features/proposals/proposal-panel";
import { createProposalDetailQuery } from "../queries/proposal-detail";
import type { EventView } from "./event-page";
import { likerFrom, useCommentSource } from "./use-comment-actions";

export function useVoting({ runner }: EventView) {
  return useCallback(
    (proposalId: string, choice: VoteChoice | null) => {
      void (choice
        ? runner.run(castVote, { proposalId, choice })
        : runner.run(withdrawVote, { proposalId }));
    },
    [runner]
  );
}

export function useProposalActions(view: EventView): ProposalActions {
  const { api, runner, snapshot } = view;
  const vote = useVoting(view);
  const openComments = useCommentSource(api, runner, likerFrom(snapshot));
  return useMemo(
    () => ({
      vote,
      join: async (proposalId: string) => {
        await runner.run(joinProposal, { proposalId });
      },
      detail: (proposalId: string) =>
        createProposalDetailQuery({ api, proposalId }),
      comments: (proposalId: string) =>
        openComments({ kind: "proposal", id: proposalId }),
    }),
    [vote, runner, api, openComments]
  );
}
