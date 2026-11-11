import { useMemo } from "react";
import { scheduleDataFrom } from "../features/schedule/data";
import { ScheduleProvider } from "../features/schedule/context";
import { scheduleLinks } from "../features/schedule/links";
import { SessionPanel } from "../features/schedule/session-panel";
import { useEventView } from "./event-page";
import { usePanel } from "./use-panel";
import { useScheduleActions } from "./use-schedule-actions";

/** The open session panel of this event, over whatever page of it is behind. */
export function PanelHost() {
  const view = useEventView();
  const { panel, open, close, back, setHash } = usePanel();
  const { snapshot, now, slug } = view;
  const data = useMemo(() => scheduleDataFrom(snapshot, now), [snapshot, now]);
  const links = useMemo(() => scheduleLinks(slug), [slug]);
  const { actions, picker } = useScheduleActions(view);
  const params = useMemo(
    () =>
      new URLSearchParams(panel?.item.record ? { record: "count" } : undefined),
    [panel?.item.record]
  );
  if (!panel || panel.item.slug !== slug) return null;
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
        key={`${panel.item.id}:${panel.depth}`}
        sessionId={panel.item.id}
        onClose={close}
        onBack={panel.depth > 1 ? back : undefined}
      />
    </ScheduleProvider>
  );
}
