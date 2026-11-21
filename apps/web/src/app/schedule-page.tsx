import { useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { scheduleLinks } from "../features/schedule/links";
import { ScheduleScreen } from "../features/schedule/schedule-screen";
import { type EventView, useEventView } from "./event-page";
import { Footer } from "./footer";
import { hardReload } from "./hard-navigate";
import { useHealth } from "./health";
import { landOnPanel } from "./panel-history";
import { SyncIndicator } from "./sync-indicator";
import { useUpdateStatus } from "./updates";
import { useMeetingClashes } from "./use-meeting-clashes";
import { usePanel } from "./use-panel";
import { useScheduleActions } from "./use-schedule-actions";
import { useUrlSearchParams } from "./use-url-search-params";

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
    panel?.item.slug === slug ? panel.item.id : null
  );
  const viewSession = params.get("viewSession");
  const redirected = useRef<string | null>(null);
  useEffect(() => {
    if (!viewSession || redirected.current === viewSession) return;
    redirected.current = viewSession;
    const rest = new URLSearchParams(params);
    rest.delete("viewSession");
    rest.delete("record");
    const query = rest.toString();
    landOnPanel(
      history,
      {
        kind: "session",
        slug,
        id: viewSession,
        record: params.get("record") === "count",
      },
      `/${slug}/schedule${query ? `?${query}` : ""}`,
      history.location.hash
    );
  }, [history, slug, viewSession, params]);
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
          panel?.landed && panel.item.slug === slug
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
