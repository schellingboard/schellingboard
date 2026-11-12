import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { inSchedPhase, inVotingPhase } from "@schellingboard/domain/phase";
import type { Session } from "@schellingboard/domain/session";
import { wantsHost } from "@schellingboard/domain/session";
import { formatOptionalTime } from "@schellingboard/domain/time";
import type { VoteChoice } from "@schellingboard/domain/vote";
import { voteChoiceToEmoji } from "@schellingboard/domain/vote-display";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTimeFormat } from "../../app/time-format";
import type {
  ProposalDetailQuery,
  ProposalDetailState,
} from "../../queries/proposal-detail";
import {
  eventContextFrom,
  ownVotesFrom,
  toEvent,
} from "../../replica/selectors";
import { CopyLinkButton } from "../../ui/copy-link-button";
import { CalendarIcon, HandRaisedIcon, PencilIcon } from "../../ui/icons";
import { SidePanel } from "../../ui/side-panel";
import { Tooltip } from "../../ui/tooltip";
import { Unavailable } from "../../ui/unavailable";
import { Comments, type CommentsHandle } from "../comments/comments-section";
import type { ProposalLinks } from "./links";
import { phaseTexts } from "./list-model";
import { ProposalBody } from "./proposal-body";
import { VoteBreakdown } from "./vote-breakdown";
import { noVoteLabel, voteLabel } from "./vote-labels";
import { VoteTally } from "./vote-tally";
import { VotingButtons } from "./voting-buttons";

export type ProposalActions = {
  /** Null withdraws. A failure is reported as a notice, not returned. */
  vote: (proposalId: string, choice: VoteChoice | null) => void;
  join: (proposalId: string) => Promise<void>;
  /** The caller destroys nothing: the panel destroys the query when done. */
  detail: (proposalId: string) => ProposalDetailQuery;
  comments: (proposalId: string) => CommentsHandle;
};

const ACTION =
  "inline-flex items-center justify-center rounded-md border border-brand-accent px-2 py-1 text-xs font-medium text-brand-fg hover:bg-brand-tint focus:outline-none focus:ring-2 focus:ring-brand-accent";

/** A proposal's details in the side panel. */
export function ProposalPanel({
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
  onBack?: () => void;
}) {
  const proposal = snapshot.proposals.find((p) => p.id === proposalId);
  const { onClose, onBack, ...details } = rest;
  return (
    <SidePanel
      label={t`Proposal details`}
      title={proposal?.title ?? t`Proposal details`}
      onClose={onClose}
      onBack={onBack}
    >
      {proposal ? (
        <Details proposal={proposal} snapshot={snapshot} {...details} />
      ) : (
        <p>
          <Trans>Proposal not found.</Trans>
        </p>
      )}
    </SidePanel>
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
  const hostVoting = isHost && inVotingPhase(event, now);
  const myVote = ownVotesFrom(snapshot).get(proposal.id);
  const { detail, retry } = useDetail(
    actions,
    proposal.id,
    schedEnabled || hostVoting,
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
              ? t`Nobody is offering to host this proposal yet. If you could run it, take it on.`
              : t`The hosts would like a co-host. Joining lets you edit this proposal with them.`}
          </p>
          <Unavailable blocked={!guestId} why={t`Select a user first`}>
            <button
              type="button"
              onClick={() => void actions.join(proposal.id)}
              className="inline-flex items-center justify-center rounded-md bg-brand px-3 py-1.5 font-medium text-on-brand transition-colors hover:bg-brand-hover aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
            >
              <HandRaisedIcon className="mr-1 h-4 w-4" />
              {proposal.hosts.length === 0
                ? t`Host this proposal`
                : t`Join as co-host`}
            </button>
          </Unavailable>
        </div>
      )}

      {canEdit && (
        <div className="mt-6 flex flex-wrap gap-2">
          <a href={links.edit(proposal.id)} className={ACTION}>
            <PencilIcon className="mr-1 h-3 w-3" />
            <Trans comment="Button: edit (verb)">Edit</Trans>
          </a>
          <Unavailable blocked={!schedEnabled} why={texts.scheduling}>
            <a
              href={schedEnabled ? links.scheduleProposal(proposal.id) : "#"}
              className={`${ACTION} aria-disabled:cursor-not-allowed aria-disabled:opacity-50`}
            >
              <CalendarIcon className="mr-1 h-3 w-3" />
              <Trans
                context="verb"
                comment="Button: put this proposal on the schedule"
              >
                Schedule
              </Trans>
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
              <Trans>Your vote:</Trans>
              <Tooltip
                content={myVote ? voteLabel(myVote) : noVoteLabel()}
                toggleable
                triggerClassName="ml-1"
              >
                <span aria-hidden>
                  {myVote ? voteChoiceToEmoji(myVote) : "-"}
                </span>
                <span className="sr-only">
                  {myVote ? voteLabel(myVote) : noVoteLabel()}
                </span>
              </Tooltip>
            </div>
          )}
          {detail?.breakdown ? (
            <VoteBreakdown stats={detail.breakdown} />
          ) : detail?.status === "ready" ? (
            <div className="text-sm text-fg-muted">
              <Trans>Total votes:</Trans>
              <VoteTally tally={detail.tally} className="ml-2" />
            </div>
          ) : (
            detail?.status === "error" && (
              <p className="text-sm text-fg-muted">
                <Trans>The votes could not be loaded.</Trans>{" "}
                <button type="button" onClick={retry} className="underline">
                  <Trans>Try again</Trans>
                </button>
              </p>
            )
          )}
        </div>
      )}
      {hostVoting && detail?.breakdown && (
        <div className="mt-6">
          <VoteBreakdown stats={detail.breakdown} />
        </div>
      )}
      {schedEnabled && (
        <Scheduled sessions={sessions} links={links} timezone={timezone} />
      )}

      <CopyLinkButton className="mt-6" />
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
  const timeFormat = useTimeFormat();
  const roomNames = (session: Session) =>
    session.locations.map((l) => l.name).join(", ");
  const link = "text-brand-fg underline hover:text-brand-fg-hover";
  const once = (session: Session) => {
    const day = formatOptionalTime(session.startTime, timezone, "EEEE");
    const time = formatOptionalTime(session.startTime, timezone, timeFormat);
    const rooms = roomNames(session);
    const href = links.session(session.id);
    return rooms ? (
      <Trans>
        This proposal was scheduled on{" "}
        <a href={href} className={link}>
          {day} at {time} in {rooms}
        </a>
        .
      </Trans>
    ) : (
      <Trans>
        This proposal was scheduled on{" "}
        <a href={href} className={link}>
          {day} at {time}
        </a>
        .
      </Trans>
    );
  };
  const manyText = (session: Session) => {
    const when = formatOptionalTime(
      session.startTime,
      timezone,
      `EEEE ${timeFormat}`
    );
    const rooms = roomNames(session);
    return rooms ? t`${when} in ${rooms}` : when;
  };
  return (
    <div className="mt-6 text-sm text-fg-muted">
      {sessions.length === 0 ? (
        <p>
          <Trans>This proposal has not been scheduled yet.</Trans>
        </p>
      ) : sessions.length === 1 ? (
        <p>{once(sessions[0])}</p>
      ) : (
        <div>
          <p>
            <Trans>This proposal was scheduled several times:</Trans>
          </p>
          <ul className="ml-4 mt-2 space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                <a href={links.session(session.id)} className={link}>
                  {manyText(session)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
