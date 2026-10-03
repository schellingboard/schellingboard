"use client";
import { useContext } from "react";

import { BackLink } from "@/app/components/back-link";
import { Proposal } from "@/app/(site)/[eventSlug]/proposal";
import { Vote } from "@/app/(site)/votes";
import type { SessionProposal } from "@/db/repositories/interfaces";
import { VotingButtons } from "@/app/(site)/[eventSlug]/proposals/voting-buttons";
import { VotesContext } from "@/app/(site)/context";
import { CommentsSection } from "@/app/(site)/[eventSlug]/comments-section";
import { useComments } from "@/app/(site)/[eventSlug]/use-comments";
import { viewProposalLinkFromOwner } from "@/app/(site)/[eventSlug]/modal-nav";

export function QuickVoting(props: {
  proposals: SessionProposal[];
  initialVotes: Vote[];
  eventName: string;
  eventSlug: string;
  timezone: string;
}) {
  const { proposals, initialVotes, eventSlug, eventName, timezone } = props;
  const { votes } = useContext(VotesContext);

  // The layout's votes outlive this page, so they include those cast in the
  // proposal modal; initialVotes may be the router's stale copy after Back.
  const voted = new Set(
    [...initialVotes, ...votes].map((vote) => vote.proposalId)
  );
  const totalProposals = proposals.length;
  const votedCount = proposals.filter((pr) => voted.has(pr.id)).length;
  const proposal = proposals
    .filter((pr) => !voted.has(pr.id))
    .sort((a, b) => a.votesCount - b.votesCount)
    .at(0);

  function showNextProposal() {
    if (proposal) {
      return (
        <>
          <Proposal
            proposal={proposal}
            titleLink={viewProposalLinkFromOwner(eventSlug, proposal.id)}
          />
          <ProposalCommentsReadOnly
            proposalId={proposal.id}
            timezone={timezone}
          />
        </>
      );
    } else {
      return (
        <p>
          You have voted on all proposals. Go to the overview to change your
          votes.
        </p>
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-32 relative">
      <BackLink href={`/${eventSlug}/proposals`}>Proposals</BackLink>
      <p className="text-lg mt-4 mb-4">{eventName} Quick Voting</p>
      <div className="text-fg-muted mb-6">
        You have voted on {votedCount} / {totalProposals} proposals
      </div>

      {showNextProposal()}

      {/* Fixed voting buttons - only show when there's a proposal to vote on */}
      {proposal && (
        <div className="fixed bottom-4 sm:bottom-16 left-1/2 transform -translate-x-1/2 z-30 bg-surface-raised/95 backdrop-blur-sm border border-line-subtle rounded-lg shadow-lg p-3 sm:p-4">
          <VotingButtons
            proposalId={proposal.id}
            votingEnabled={true}
            votingDisabledText=""
            large={true}
          />
        </div>
      )}
    </div>
  );
}

function ProposalCommentsReadOnly(props: {
  proposalId: string;
  timezone: string;
}) {
  const { comments } = useComments(
    `/api/proposal/${props.proposalId}/comments`
  );
  return (
    <CommentsSection readOnly timezone={props.timezone} comments={comments} />
  );
}
