import { useMemo } from "react";
import { scheduleDataFrom } from "../features/schedule/data";
import { ScheduleProvider } from "../features/schedule/context";
import { scheduleLinks } from "../features/schedule/links";
import { SessionPanel } from "../features/schedule/session-panel";
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
  if (!panel || panel.item.slug !== slug) return null;
  const key = `${panel.item.kind}:${panel.item.id}:${panel.depth}`;
  return panel.item.kind === "session" ? (
    <SessionHost key={key} item={panel.item} depth={panel.depth} />
  ) : (
    <ProposalHost key={key} item={panel.item} depth={panel.depth} />
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
