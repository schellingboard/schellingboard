import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import {
  createMeetingClashesQuery,
  type MeetingClashes,
} from "../queries/meeting-clashes";
import type { ReplicaStore } from "../replica/store";

/** The clashes of the viewer's 1-on-1s, fetched again after a session, RSVP or meeting change. */
export function useMeetingClashes(
  api: ApiClient,
  store: ReplicaStore
): MeetingClashes {
  const { id: eventId } = useSyncExternalStore(
    store.subscribe,
    store.get
  ).event;
  const query = useMemo(
    () => createMeetingClashesQuery({ api, eventId }),
    [api, eventId]
  );
  const clashes = useSyncExternalStore(query.subscribe, query.get);
  const revision = useSyncExternalStore(
    store.subscribe,
    store.meetingsRevision
  );
  const watching = useSyncExternalStore(
    store.subscribe,
    () => (store.get().me?.meetings.length ?? 0) > 0
  );
  useEffect(() => {
    if (watching) query.schedule();
    return () => query.destroy();
  }, [query, watching, revision]);
  return clashes;
}
