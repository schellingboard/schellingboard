import type { ApiClient } from "@schellingboard/api-client";
import type { MeetingView } from "../features/schedule/meeting-view";
import { createObservable } from "./store";

export type MeetingClashes = ReadonlyMap<string, MeetingView["clashes"]>;
export type MeetingClashesQuery = ReturnType<typeof createMeetingClashesQuery>;

const NONE: MeetingClashes = new Map();

/**
 * Clashes rest on other guests' RSVPs, which the replica never holds, so the
 * viewer's meetings are asked of the server again after a change.
 */
export function createMeetingClashesQuery({
  api,
  eventId,
  debounceMs = 500,
}: {
  api: ApiClient;
  eventId: string;
  debounceMs?: number;
}) {
  const state = createObservable<MeetingClashes>(NONE);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let latest = 0;

  const load = async () => {
    const mine = ++latest;
    try {
      const { data } = await api.GET("/api/v1/meetings", {
        params: { query: { eventId } },
      });
      if (data && mine === latest)
        state.set(new Map(data.meetings.map((m) => [m.id, m.clashes])));
    } catch {
      // The last answer stays; the next change asks again.
    }
  };

  return {
    get: state.get,
    subscribe: state.subscribe,
    load,
    schedule() {
      clearTimeout(timer);
      timer = setTimeout(() => void load(), debounceMs);
    },
    /** Drops a pending refetch; a later `schedule` works again. */
    destroy() {
      clearTimeout(timer);
    },
  };
}
