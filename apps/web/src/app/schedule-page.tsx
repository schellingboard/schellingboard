import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { scheduleLinks } from "../features/schedule/links";
import { ScheduleScreen } from "../features/schedule/schedule-screen";
import { useEventView, type EventView } from "./event-page";
import { Footer } from "./footer";
import { hardReload } from "./hard-navigate";
import { useMeetingClashes } from "./use-meeting-clashes";
import { useHealth } from "./health";
import { useUpdateStatus } from "./updates";
import { useUrlSearchParams } from "./use-url-search-params";
import { landOnPanel } from "./panel-history";
import { useScheduleActions } from "./use-schedule-actions";
import { usePanel } from "./use-panel";
import { SyncIndicator } from "./sync-indicator";

/** An event's schedule, inside the event layout. */
export function SchedulePage() {
  return <Loaded {...useEventView()} />;
}

function Loaded(view: EventView) {
  const { api, slug, store, snapshot, now } = view;
  const health = useHealth(api);
  const update = useUpdateStatus(api);
  const { params, change: changeParams, back, setHash } = useUrlSearchParams();
  const links = useMemo(() => scheduleLinks(slug), [slug]);
  const clashes = useMeetingClashes(api, store);
  const { history } = useRouter();
  const { panel, open } = usePanel();
  const [openAtMount] = useState(() =>
    panel?.item.kind === "session" && panel.item.slug === slug
      ? panel.item.id
      : null
  );
  const viewSession = params.get("viewSession");
  const viewMeeting = params.get("viewMeeting");
  const redirected = useRef<string | null>(null);
  useEffect(() => {
    const target = viewSession ?? viewMeeting;
    if (!target) {
      redirected.current = null;
      return;
    }
    if (redirected.current === target) return;
    redirected.current = target;
    const rest = new URLSearchParams(params);
    rest.delete("viewSession");
    rest.delete("viewMeeting");
    rest.delete("record");
    const query = rest.toString();
    landOnPanel(
      history,
      viewSession
        ? {
            kind: "session",
            slug,
            id: viewSession,
            record: params.get("record") === "count",
          }
        : { kind: "meeting", slug, id: viewMeeting! },
      `/${slug}/schedule${query ? `?${query}` : ""}`,
      history.location.hash
    );
  }, [history, slug, viewSession, viewMeeting, params]);
  const openSession = useCallback(
    (id: string) => open({ kind: "session", slug, id }),
    [open, slug]
  );
  const { actions, picker } = useScheduleActions(view);
  return (
    <>
      {picker}
      <ScheduleScreen
        actions={actions}
        clashes={clashes}
        snapshot={snapshot}
        now={now}
        links={links}
        params={params}
        onParamsChange={changeParams}
        onBack={back}
        openSession={openSession}
        revealSessionId={
          panel?.landed &&
          panel.item.kind === "session" &&
          panel.item.slug === slug
            ? panel.item.id
            : openAtMount
        }
        onHashChange={setHash}
        sync={<SyncIndicator store={store} />}
        footer={<Footer version={health?.version} update={update} inline />}
        onReload={hardReload}
      />
    </>
  );
}
