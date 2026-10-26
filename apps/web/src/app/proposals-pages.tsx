import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "@tanstack/react-router";
import type { VoteChoice } from "@schellingboard/domain/vote";
import { joinProposal } from "../commands/join-proposal";
import { proposalFormCalls } from "../commands/proposal-form";
import { castVote, withdrawVote } from "../commands/vote";
import { ProposalForm } from "../features/proposals/proposal-form";
import { proposalLinks } from "../features/proposals/links";
import { ProposalModal } from "../features/proposals/proposal-modal";
import { ProposalsScreen } from "../features/proposals/proposals-screen";
import { QuickVotingScreen } from "../features/proposals/quick-voting-screen";
import { useStandings } from "../features/proposals/use-standings";
import { createProposalDetailQuery } from "../queries/proposal-detail";
import { createStandingsQuery } from "../queries/proposal-standings";
import { useEventView, type EventView } from "./event-page";
import {
  proposalOpenedByClick,
  takeProposalOpenedByClick,
} from "./proposal-nav";
import { useCommentSource } from "./use-comment-actions";
import { useUrlSearchParams } from "./use-url-search-params";

const LOCAL_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

function useVoting({ runner }: EventView) {
  return useCallback(
    (proposalId: string, choice: VoteChoice | null) => {
      void (choice
        ? runner.run(castVote, { proposalId, choice })
        : runner.run(withdrawVote, { proposalId }));
    },
    [runner]
  );
}

function useEventStandings({ api, snapshot }: EventView) {
  const eventId = snapshot.event.id;
  return useStandings(
    useMemo(() => createStandingsQuery({ api, eventId }), [api, eventId])
  );
}

/** The proposals of an event, with a proposal's details over them. */
export function ProposalsPage() {
  return <List {...useEventView()} />;
}

function List(view: EventView) {
  const { api, slug, runner, snapshot, now } = view;
  const { params, change, back, setHash } = useUrlSearchParams();
  const links = useMemo(() => proposalLinks(slug), [slug]);
  const { standings } = useEventStandings(view);
  const vote = useVoting(view);
  const openComments = useCommentSource(api, runner, snapshot);
  const actions = useMemo(
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
  const viewed = params.get("viewProposal");
  useEffect(() => {
    if (!viewed) proposalOpenedByClick(false);
  }, [viewed]);

  return (
    <>
      <ProposalsScreen
        snapshot={snapshot}
        links={links}
        now={now}
        localZone={LOCAL_ZONE}
        standings={standings}
        onVote={vote}
      />
      {viewed && (
        <ProposalModal
          proposalId={viewed}
          snapshot={snapshot}
          now={now}
          localZone={LOCAL_ZONE}
          links={links}
          actions={actions}
          setHash={setHash}
          onClose={() => {
            if (takeProposalOpenedByClick()) return back();
            const updated = new URLSearchParams(params);
            updated.delete("viewProposal");
            change(updated);
          }}
        />
      )}
    </>
  );
}

/** The proposals the viewer has not voted on, one at a time. */
export function QuickVotingPage() {
  return <QuickVoting {...useEventView()} />;
}

function QuickVoting(view: EventView) {
  const { api, slug, runner, snapshot, now } = view;
  const links = useMemo(() => proposalLinks(slug), [slug]);
  const { standings, status } = useEventStandings(view);
  const vote = useVoting(view);
  const openComments = useCommentSource(api, runner, snapshot);
  const comments = useCallback(
    (proposalId: string) => openComments({ kind: "proposal", id: proposalId }),
    [openComments]
  );
  return (
    <QuickVotingScreen
      snapshot={snapshot}
      links={links}
      now={now}
      localZone={LOCAL_ZONE}
      standings={standings}
      standingsStatus={status}
      onVote={vote}
      comments={comments}
    />
  );
}

/** Adds a proposal, or edits the one named. */
export function ProposalFormPage({ proposalId }: { proposalId?: string }) {
  return <Form {...useEventView()} proposalId={proposalId} />;
}

function Form({
  api,
  slug,
  snapshot,
  proposalId,
}: EventView & { proposalId?: string }) {
  const { history } = useRouter();
  const links = useMemo(() => proposalLinks(slug), [slug]);
  const actions = useMemo(() => proposalFormCalls(api), [api]);
  return (
    <ProposalForm
      snapshot={snapshot}
      proposalId={proposalId}
      links={links}
      actions={actions}
      onDone={() => history.push(links.proposals)}
    />
  );
}
