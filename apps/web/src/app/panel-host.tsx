import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { scheduleDataFrom } from "../features/schedule/data";
import { useTimeFormat } from "./time-format";
import { ScheduleProvider } from "../features/schedule/context";
import { scheduleLinks } from "../features/schedule/links";
import { SessionPanel } from "../features/schedule/session-panel";
import {
  MeetingNeedsName,
  MeetingPanel,
} from "../features/meetings/meeting-panel";
import { proposalLinks } from "../features/proposals/links";
import { ProposalPanel } from "../features/proposals/proposal-panel";
import { EventViewContext, Ready, useEventView } from "./event-page";
import { LOCAL_ZONE } from "./local-zone";
import { backgroundOf, type PanelItem } from "./panel-history";
import { SidePanel } from "../ui/side-panel";
import { SpaLinks } from "./spa-links";
import type { AppServices } from "./services";
import { usePanel } from "./use-panel";
import { useScheduleSession } from "./use-schedule-session";
import { useProposalActions } from "./use-proposal-actions";
import { useScheduleActions } from "./use-schedule-actions";
import { useViewer } from "./viewer";

/** The open panel of this event, over whatever page of it is behind. */
export function PanelHost() {
  const { panel } = usePanel();
  const { slug } = useEventView();
  if (!panel || panel.item.kind === "profile" || panel.item.slug !== slug)
    return null;
  const key = `${panel.item.kind}:${panel.item.id}:${panel.depth}`;
  if (panel.item.kind === "session")
    return <SessionHost key={key} item={panel.item} depth={panel.depth} />;
  if (panel.item.kind === "meeting")
    return <MeetingHost key={key} item={panel.item} depth={panel.depth} />;
  return <ProposalHost key={key} item={panel.item} depth={panel.depth} />;
}

/**
 * The panel of an event the page behind does not belong to (a session over the
 * directory): it opens that event's replica for the panel alone, and keeps it
 * while the panel stays open, even over a profile in between.
 */
export function ForeignPanelHost({ services }: { services: AppServices }) {
  const { panel } = usePanel();
  const { history } = useRouter();
  const behind = backgroundOf(history.location).pathname.split("/")[1];
  const wanted =
    panel && panel.item.kind !== "profile" && behind !== panel.item.slug
      ? panel.item.slug
      : null;
  const [kept, setKept] = useState<string | null>(null);
  const slug = wanted ?? (panel ? kept : null);
  if (slug !== kept) setKept(slug);
  if (!panel || !slug || behind === slug) return null;
  return <ForeignEvent key={slug} services={services} slug={slug} />;
}

function ForeignEvent({
  services,
  slug,
}: {
  services: AppServices;
  slug: string;
}) {
  const { api } = services;
  const viewer = useViewer();
  const { close } = usePanel();
  const session = useScheduleSession({
    api,
    slug,
    viewer: viewer.guestId,
    persistence: services.persistence,
    createSource: services.createSource,
  });
  if (session.status !== "ready") {
    return (
      <SidePanel label="Event details" title="Event" onClose={close}>
        {session.status === "loading" && <p>Loading…</p>}
        {session.status === "missing" && <p>Event not found.</p>}
        {session.status === "failed" && (
          <>
            <p>The event could not be loaded.</p>
            <button type="button" onClick={session.retry} className="underline">
              Try again
            </button>
          </>
        )}
      </SidePanel>
    );
  }
  return (
    <Ready api={api} slug={slug} store={session.store} runner={session.runner}>
      {(view) => (
        <EventViewContext.Provider value={view}>
          <SpaLinks slug={slug}>
            <PanelHost />
          </SpaLinks>
        </EventViewContext.Provider>
      )}
    </Ready>
  );
}

function MeetingHost({
  item,
  depth,
}: {
  item: Extract<PanelItem, { kind: "meeting" }>;
  depth: number;
}) {
  const view = useEventView();
  const { close, back } = usePanel();
  const { snapshot, now, slug } = view;
  const timeFormat = useTimeFormat();
  const data = useMemo(
    () => scheduleDataFrom(snapshot, now, timeFormat),
    [snapshot, now, timeFormat]
  );
  const links = useMemo(() => scheduleLinks(slug), [slug]);
  const { actions, picker } = useScheduleActions(view);
  const onBack = depth > 1 ? back : undefined;
  if (!data.guestId)
    return (
      <MeetingNeedsName
        awaitingLogin={actions.awaitingLogin}
        onClose={close}
        onBack={onBack}
      />
    );
  return (
    <>
      {picker}
      <MeetingPanel
        meeting={data.meetings.find((m) => m.id === item.id)}
        now={now}
        readOnly={data.readOnly}
        profileHref={links.guest}
        onAnswer={(response) => void actions.answerMeeting(item.id, response)}
        onCancel={(note) => void actions.cancelMeeting(item.id, note)}
        onClose={close}
        onBack={onBack}
      />
    </>
  );
}

function SessionHost({
  item,
  depth,
}: {
  item: Extract<PanelItem, { kind: "session" }>;
  depth: number;
}) {
  const view = useEventView();
  const { open, close, back, setHash } = usePanel();
  const { snapshot, now, slug } = view;
  const timeFormat = useTimeFormat();
  const data = useMemo(
    () => scheduleDataFrom(snapshot, now, timeFormat),
    [snapshot, now, timeFormat]
  );
  const links = useMemo(() => scheduleLinks(slug), [slug]);
  const { actions, picker } = useScheduleActions(view);
  const params = useMemo(
    () => new URLSearchParams(item.record ? { record: "count" } : undefined),
    [item.record]
  );
  return (
    <ScheduleProvider
      value={{
        data,
        links,
        params,
        actions,
        openSession: (id) =>
          open({ kind: "session", slug, id }, { fromPanel: true }),
        setHash,
      }}
    >
      {picker}
      <SessionPanel
        sessionId={item.id}
        onClose={close}
        onBack={depth > 1 ? back : undefined}
      />
    </ScheduleProvider>
  );
}

function ProposalHost({
  item,
  depth,
}: {
  item: Extract<PanelItem, { kind: "proposal" }>;
  depth: number;
}) {
  const view = useEventView();
  const { close, back, setHash } = usePanel();
  const links = useMemo(() => proposalLinks(view.slug), [view.slug]);
  const actions = useProposalActions(view);
  return (
    <ProposalPanel
      proposalId={item.id}
      snapshot={view.snapshot}
      now={view.now}
      localZone={LOCAL_ZONE}
      links={links}
      actions={actions}
      setHash={setHash}
      onClose={close}
      onBack={depth > 1 ? back : undefined}
    />
  );
}
