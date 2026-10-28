import { useCallback, useState } from "react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { inVotingPhase } from "@schellingboard/domain/phase";
import type { VoteChoice } from "@schellingboard/domain/vote";
import type {
  Standing,
  StandingsState,
} from "../../queries/proposal-standings";
import { ownVotesFrom, proposalsFrom, toEvent } from "../../replica/selectors";
import { Comments, type CommentsHandle } from "../comments/comments-section";
import type { ProposalLinks } from "./links";
import { phaseTexts } from "./list-model";
import { ProposalBody } from "./proposal-body";
import { VotingButtons } from "./voting-buttons";

export type QuickVotingProps = {
  snapshot: Snapshot;
  links: ProposalLinks;
  now: Date;
  localZone: string | null;
  standings: ReadonlyMap<string, Standing>;
  /** The order is not known until the counts are in. */
  standingsStatus: StandingsState["status"];
  /** A failure is reported as a notice, not returned. */
  onVote: (proposalId: string, choice: VoteChoice | null) => void;
  comments: (proposalId: string) => CommentsHandle;
};

const BACK =
  "inline-block py-1 -my-1 text-sm text-fg-subtle hover:text-fg-muted";

/** The proposals the viewer has not voted on, one at a time, fewest votes first. */
export function QuickVotingScreen({
  snapshot,
  links,
  now,
  localZone,
  standings,
  standingsStatus,
  onVote,
  comments,
}: QuickVotingProps) {
  const guestId = snapshot.me?.guestId ?? null;
  const [shownId, setShownId] = useState<string | null>(null);
  const back = (
    <a href={links.proposals} className={BACK}>
      ← Proposals
    </a>
  );
  if (!guestId)
    return (
      <div className="mx-auto max-w-2xl px-4">
        {back}
        <div className="mt-6">Please choose who you are first.</div>
      </div>
    );

  const votes = ownVotesFrom(snapshot);
  const votable = proposalsFrom(snapshot).filter(
    (p) => !p.hosts.some((h) => h.id === guestId)
  );
  const unvoted = votable.filter((p) => !votes.has(p.id));
  const loading = standingsStatus === "idle" || standingsStatus === "loading";
  // Stays put until voted on: a proposal someone adds meanwhile has the
  // fewest votes and would otherwise replace the one being read.
  const next =
    unvoted.find((p) => p.id === shownId) ??
    unvoted.sort(
      (a, b) =>
        (standings.get(a.id)?.total ?? 0) - (standings.get(b.id)?.total ?? 0)
    )[0];
  if (!loading && next && next.id !== shownId) setShownId(next.id);
  const votedCount = votable.filter((p) => votes.has(p.id)).length;
  const texts = phaseTexts(snapshot.event, now, true, localZone);
  const votingEnabled = inVotingPhase(toEvent(snapshot.event), now);

  return (
    <div className="relative mx-auto max-w-2xl px-4 pb-32">
      {back}
      <p className="mb-4 mt-4 text-lg">{snapshot.event.name} Quick Voting</p>
      <div className="mb-6 text-fg-muted">
        You have voted on {votedCount} / {votable.length} proposals
      </div>
      {loading ? (
        <p>Loading proposals...</p>
      ) : next ? (
        <>
          <h1 className="mb-2 mt-5 text-xl font-semibold">
            <a
              href={`${links.quickVoting}?${new URLSearchParams({ viewProposal: next.id })}`}
              className="hover:underline"
            >
              {next.title}
            </a>
          </h1>
          <ProposalBody
            proposal={next}
            links={links}
            breakMinutes={snapshot.event.breakMinutes ?? 0}
          />
          <ReadOnlyComments
            proposalId={next.id}
            comments={comments}
            snapshot={snapshot}
            links={links}
          />
          <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-line-subtle bg-surface-raised/95 p-3 shadow-lg backdrop-blur-sm sm:bottom-16 sm:p-4">
            <VotingButtons
              large
              chosen={undefined}
              enabled={votingEnabled}
              why={texts.voting}
              onVote={(choice) => onVote(next.id, choice)}
            />
          </div>
        </>
      ) : (
        <p>
          You have voted on all proposals. Go to the overview to change your
          votes.
        </p>
      )}
    </div>
  );
}

function ReadOnlyComments({
  proposalId,
  comments,
  snapshot,
  links,
}: {
  proposalId: string;
  comments: QuickVotingProps["comments"];
  snapshot: Snapshot;
  links: ProposalLinks;
}) {
  const open = useCallback(() => comments(proposalId), [comments, proposalId]);
  return (
    <Comments
      readOnly
      open={open}
      viewerId={snapshot.me?.guestId ?? null}
      timezone={snapshot.event.timezone}
      guestHref={links.guest}
    />
  );
}
