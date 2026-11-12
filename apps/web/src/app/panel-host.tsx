import { useMemo } from "react";
import { scheduleDataFrom } from "../features/schedule/data";
import { ScheduleProvider } from "../features/schedule/context";
import { scheduleLinks } from "../features/schedule/links";
import { SessionPanel } from "../features/schedule/session-panel";
import {
  MeetingNeedsName,
  MeetingPanel,
} from "../features/meetings/meeting-panel";
import { proposalLinks } from "../features/proposals/links";
import { ProposalPanel } from "../features/proposals/proposal-panel";
import { useEventView } from "./event-page";
import { LOCAL_ZONE } from "./local-zone";
import type { PanelItem } from "./panel-history";
import { usePanel } from "./use-panel";
import { useProposalActions } from "./use-proposal-actions";
import { useScheduleActions } from "./use-schedule-actions";

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
  const data = useMemo(() => scheduleDataFrom(snapshot, now), [snapshot, now]);
  const links = useMemo(() => scheduleLinks(slug), [slug]);
  const { actions, picker } = useScheduleActions(view);
  const shareUrl = links.meeting(item.id);
  const onBack = depth > 1 ? back : undefined;
  if (!data.guestId)
    return (
      <MeetingNeedsName
        awaitingLogin={actions.awaitingLogin}
        shareUrl={shareUrl}
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
        shareUrl={shareUrl}
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
  const data = useMemo(() => scheduleDataFrom(snapshot, now), [snapshot, now]);
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
