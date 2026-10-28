import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { inSchedPhase, inVotingPhase } from "@schellingboard/domain/phase";
import type { Session } from "@schellingboard/domain/session";
import { wantsHost } from "@schellingboard/domain/session";
import { formatOptionalTime, TIME_FORMAT } from "@schellingboard/domain/time";
import type { VoteChoice } from "@schellingboard/domain/vote";
import {
  NO_VOTE_LABEL,
  voteChoiceToEmoji,
  voteChoiceToLabel,
} from "@schellingboard/domain/vote-display";
import type {
  ProposalDetailQuery,
  ProposalDetailState,
} from "../../queries/proposal-detail";
import {
  eventContextFrom,
  ownVotesFrom,
  toEvent,
} from "../../replica/selectors";
import { Dialog } from "../../ui/dialog";
import { CalendarIcon, HandRaisedIcon, PencilIcon } from "../../ui/icons";
import { Unavailable } from "../../ui/unavailable";
import { Comments, type CommentsHandle } from "../comments/comments-section";
import type { ProposalLinks } from "./links";
import { phaseTexts } from "./list-model";
import { ProposalBody } from "./proposal-body";
import { VoteBreakdown } from "./vote-breakdown";
import { VoteTally } from "./vote-tally";
import { VotingButtons } from "./voting-buttons";

export type ProposalActions = {
  /** Null withdraws. A failure is reported as a notice, not returned. */
  vote: (proposalId: string, choice: VoteChoice | null) => void;
  join: (proposalId: string) => Promise<void>;
  /** The caller destroys nothing: the modal destroys the query when done. */
  detail: (proposalId: string) => ProposalDetailQuery;
  comments: (proposalId: string) => CommentsHandle;
};

const ACTION =
  "inline-flex items-center justify-center rounded-md border border-brand-accent px-2 py-1 text-xs font-medium text-brand-fg hover:bg-brand-tint focus:outline-none focus:ring-2 focus:ring-brand-accent";

/** A proposal's details over the proposals list or quick voting, opened by `?viewProposal=`. */
export function ProposalModal({
  proposalId,
  snapshot,
  ...rest
}: {
  proposalId: string;
  snapshot: Snapshot;
  now: Date;
  localZone: string | null;
  links: ProposalLinks;
  actions: ProposalActions;
  setHash: (hash: string) => void;
  onClose: () => void;
}) {
  const proposal = snapshot.proposals.find((p) => p.id === proposalId);
  return (
    <Dialog
      open
      wide
      onClose={rest.onClose}
      label="Proposal details"
      title={proposal?.title ?? "Proposal details"}
    >
      {proposal ? (
        <Details proposal={proposal} snapshot={snapshot} {...rest} />
      ) : (
        <p>Proposal not found.</p>
      )}
    </Dialog>
  );
}

/** Fetched again when the viewer or the hosts change: what it holds depends on both. */
function useDetail(
  actions: ProposalActions,
  proposalId: string,
  enabled: boolean,
  viewerId: string | null,
  hostKey: string
) {
  const [state, setState] = useState<ProposalDetailState | null>(null);
  const current = useRef<ProposalDetailQuery | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const query = actions.detail(proposalId);
    current.current = query;
    const sync = () => setState(query.get());
    const unsubscribe = query.subscribe(sync);
    sync();
    void query.refresh();
    return () => {
      unsubscribe();
      query.destroy();
    };
  }, [actions, proposalId, enabled, viewerId, hostKey]);
  const retry = useCallback(() => void current.current?.refresh(), []);
  return { detail: enabled ? state : null, retry };
}

function Details({
  proposal,
  snapshot,
  now,
  localZone,
  links,
  actions,
  setHash,
}: {
  proposal: Snapshot["proposals"][number];
  snapshot: Snapshot;
  now: Date;
  localZone: string | null;
  links: ProposalLinks;
  actions: ProposalActions;
  setHash: (hash: string) => void;
}) {
  const guestId = snapshot.me?.guestId ?? null;
  const event = toEvent(snapshot.event);
  const texts = phaseTexts(snapshot.event, now, !!guestId, localZone);
  const isHost = !!guestId && proposal.hosts.some((h) => h.id === guestId);
  const canEdit = proposal.hosts.length === 0 || isHost;
  const votingEnabled = !!guestId && inVotingPhase(event, now);
  const schedEnabled = inSchedPhase(event, now);
  const myVote = ownVotesFrom(snapshot).get(proposal.id);
  const { detail, retry } = useDetail(
    actions,
    proposal.id,
    schedEnabled,
    guestId,
    proposal.hosts.map((h) => h.id).join(",")
  );
  const timezone = snapshot.event.timezone;

  const sessions = useMemo(
    () =>
      eventContextFrom(snapshot).sessions.filter(
        (s) => s.proposalId === proposal.id
      ),
    [snapshot, proposal.id]
  );
  const openComments = useCallback(
    () => actions.comments(proposal.id),
    [actions, proposal.id]
  );
  const breakMinutes = snapshot.event.breakMinutes ?? 0;

  return (
    <div className="break-words">
      <ProposalBody
        proposal={proposal}
        links={links}
        breakMinutes={breakMinutes}
      />

      {wantsHost(proposal) && !isHost && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-brand-tint-hover bg-brand-tint px-3 py-2 text-sm text-fg-muted">
          <p className="flex-1 basis-64">
            {proposal.hosts.length === 0
              ? "Nobody is offering this session yet. If you could give it, take it on."
              : "The hosts would like a co-host. Joining lets you edit this proposal with them."}
          </p>
          <Unavailable blocked={!guestId} why="Select a user first">
            <button
              type="button"
              onClick={() => void actions.join(proposal.id)}
              className="inline-flex items-center justify-center rounded-md bg-brand px-3 py-1.5 font-medium text-on-brand transition-colors hover:bg-brand-hover aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            >
              <HandRaisedIcon className="mr-1 h-4 w-4" />
              {proposal.hosts.length === 0
                ? "Host this session"
                : "Join as co-host"}
            </button>
          </Unavailable>
        </div>
      )}

      {canEdit && (
        <div className="mt-6 flex flex-wrap gap-2">
          <a href={links.edit(proposal.id)} className={ACTION}>
            <PencilIcon className="mr-1 h-3 w-3" />
            Edit
          </a>
          <Unavailable blocked={!schedEnabled} why={texts.scheduling}>
            <a
              href={schedEnabled ? links.scheduleProposal(proposal.id) : "#"}
              className={`${ACTION} aria-disabled:cursor-not-allowed aria-disabled:opacity-50`}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              Schedule
            </a>
          </Unavailable>
        </div>
      )}

      {!isHost && !schedEnabled && (
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start sm:gap-3">
          <VotingButtons
            large
            chosen={myVote}
            enabled={votingEnabled}
            why={texts.voting}
            onVote={(choice) =>
              actions.vote(proposal.id, choice === myVote ? null : choice)
            }
          />
        </div>
      )}
      {schedEnabled && (
        <div className="mt-6 space-y-3">
          {!isHost && (
            <div className="text-sm text-fg-muted">
              Your vote:
              <span
                title={myVote ? voteChoiceToLabel(myVote) : NO_VOTE_LABEL}
                className="ml-1"
              >
                {myVote ? voteChoiceToEmoji(myVote) : "-"}
              </span>
            </div>
          )}
          {detail?.breakdown ? (
            <VoteBreakdown stats={detail.breakdown} />
          ) : detail?.status === "ready" ? (
            <div className="text-sm text-fg-muted">
              Total votes:
              <VoteTally tally={detail.tally} className="ml-2" />
            </div>
          ) : (
            detail?.status === "error" && (
              <p className="text-sm text-fg-muted">
                The votes could not be loaded.{" "}
                <button type="button" onClick={retry} className="underline">
                  Try again
                </button>
              </p>
            )
          )}
        </div>
      )}
      {schedEnabled && (
        <Scheduled sessions={sessions} links={links} timezone={timezone} />
      )}

      <Comments
        open={openComments}
        viewerId={guestId}
        timezone={timezone}
        guestHref={links.guest}
        commentHref={(id) => `${links.view(proposal.id)}#comment-${id}`}
        setHash={setHash}
      />
    </div>
  );
}

function Scheduled({
  sessions,
  links,
  timezone,
}: {
  sessions: Session[];
  links: ProposalLinks;
  timezone: string;
}) {
  const inRooms = (session: Session) =>
    session.locations.length > 0
      ? ` in ${session.locations.map((l) => l.name).join(", ")}`
      : "";
  const link = "text-brand-fg underline hover:text-brand-fg-hover";
  return (
    <div className="mt-6 text-sm text-fg-muted">
      {sessions.length === 0 ? (
        <p>This proposal has not been scheduled yet.</p>
      ) : sessions.length === 1 ? (
        <p>
          This proposal was scheduled on{" "}
          <a href={links.session(sessions[0].id)} className={link}>
            {formatOptionalTime(sessions[0].startTime, timezone, "EEEE")} at{" "}
            {formatOptionalTime(sessions[0].startTime, timezone, TIME_FORMAT)}
            {inRooms(sessions[0])}
          </a>
          .
        </p>
      ) : (
        <div>
          <p>This proposal was scheduled several times:</p>
          <ul className="ml-4 mt-2 space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                <a href={links.session(session.id)} className={link}>
                  {formatOptionalTime(
                    session.startTime,
                    timezone,
                    `EEEE ${TIME_FORMAT}`
                  )}
                  {inRooms(session)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
