import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { proposalFormCalls } from "../commands/proposal-form";
import { ProposalForm } from "../features/proposals/proposal-form";
import { proposalLinks } from "../features/proposals/links";
import { ProposalsScreen } from "../features/proposals/proposals-screen";
import { QuickVotingScreen } from "../features/proposals/quick-voting-screen";
import { useStandings } from "../features/proposals/use-standings";
import { createStandingsQuery } from "../queries/proposal-standings";
import { useEventView, type EventView } from "./event-page";
import { LOCAL_ZONE } from "./local-zone";
import { landOnPanel } from "./panel-history";
import { useVoting } from "./use-proposal-actions";
import { likerFrom, useCommentSource } from "./use-comment-actions";
import { useUrlSearchParams } from "./use-url-search-params";

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
  const { slug, snapshot, now } = view;
  const links = useMemo(() => proposalLinks(slug), [slug]);
  const { standings } = useEventStandings(view);
  const vote = useVoting(view);
  useViewProposalRedirect(slug, links.proposals);
  const { params, change } = useUrlSearchParams();

  return (
    <>
      <ProposalsScreen
        snapshot={snapshot}
        links={links}
        now={now}
        localZone={LOCAL_ZONE}
        standings={standings}
        onVote={vote}
        params={params}
        onParamsChange={change}
      />
    </>
  );
}

/** Sends an old `?viewProposal=` address to the proposal's panel over the page it was on. */
function useViewProposalRedirect(slug: string, page: string) {
  const { history } = useRouter();
  const { params } = useUrlSearchParams();
  const viewed = params.get("viewProposal");
  const redirected = useRef<string | null>(null);
  useEffect(() => {
    if (!viewed) {
      redirected.current = null;
      return;
    }
    if (redirected.current === viewed) return;
    redirected.current = viewed;
    const rest = new URLSearchParams(params);
    rest.delete("viewProposal");
    const query = rest.toString();
    landOnPanel(
      history,
      { kind: "proposal", slug, id: viewed },
      `${page}${query ? `?${query}` : ""}`,
      history.location.hash
    );
  }, [history, slug, page, viewed, params]);
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
  useViewProposalRedirect(slug, links.quickVoting);
  const openComments = useCommentSource(api, runner, likerFrom(snapshot));
  const comments = useCallback(
    (proposalId: string) => openComments({ kind: "proposal", id: proposalId }),
    [openComments]
  );
  return (
    <>
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
    </>
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
