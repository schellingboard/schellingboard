import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { EventPhase, getCurrentPhase } from "@schellingboard/domain/phase";
import { eventContextFrom } from "../replica/selectors";
import { legacyScheduleLinks } from "../features/schedule/links";
import {
  ScheduleScreen,
  type ScheduleActions,
} from "../features/schedule/schedule-screen";
import { attendeeCountApi } from "../queries/attendee-count";
import { createAttendeesQuery } from "../queries/attendees";
import { addRsvp, removeRsvp } from "../commands/rsvp";
import { Message, useEventView, type EventView } from "./event-page";
import { Footer } from "./footer";
import { hardReload } from "./hard-navigate";
import { newKey } from "../commands/keys";
import { useHealth } from "./health";
import { useUpdateStatus } from "./updates";
import { likerFrom, useCommentSource } from "./use-comment-actions";
import { useUrlSearchParams } from "./use-url-search-params";
import { NamePicker } from "./user-menu";
import { useViewer } from "./viewer";
import { SyncIndicator } from "./sync-indicator";

/** An event's schedule, inside the event layout. */
export function SchedulePage() {
  return <Loaded {...useEventView()} />;
}

function Loaded({ api, slug, runner, store, snapshot, now }: EventView) {
  const health = useHealth(api);
  const update = useUpdateStatus(api);
  const { params, change: changeParams, back, setHash } = useUrlSearchParams();
  const links = useMemo(() => legacyScheduleLinks(slug), [slug]);
  const viewer = useViewer();
  const { history } = useRouter();
  const [picking, setPicking] = useState(false);
  const openComments = useCommentSource(api, runner, likerFrom(snapshot));
  const actions = useMemo<ScheduleActions>(
    () => ({
      pickName: () => setPicking(true),
      toggleRsvp: async (sessionId, withdraw) => {
        await runner.run(withdraw ? removeRsvp : addRsvp, { sessionId });
      },
      attendees: (sessionId) => createAttendeesQuery({ api, sessionId }),
      attendeeCount: attendeeCountApi(api, newKey),
      comments: (sessionId) => openComments({ kind: "session", id: sessionId }),
    }),
    [runner, api, openComments]
  );
  const phase = getCurrentPhase(eventContextFrom(snapshot).event, now);

  useEffect(() => {
    if (phase === EventPhase.PROPOSAL || phase === EventPhase.VOTING)
      history.replace(`/${slug}/proposals`);
  }, [phase, slug, history]);

  if (phase !== EventPhase.SCHEDULING)
    return phase === EventPhase.INACTIVE ? (
      <Message>Event unavailable: {snapshot.event.name}</Message>
    ) : null;

  return (
    <>
      <NamePicker
        open={picking}
        onClose={() => setPicking(false)}
        guests={snapshot.guests}
        choose={viewer.choose}
      />
      <ScheduleScreen
        actions={actions}
        snapshot={snapshot}
        now={now}
        links={links}
        params={params}
        onParamsChange={changeParams}
        onBack={back}
        onHashChange={setHash}
        sync={<SyncIndicator store={store} />}
        footer={<Footer version={health?.version} update={update} inline />}
        onReload={hardReload}
      />
    </>
  );
}
