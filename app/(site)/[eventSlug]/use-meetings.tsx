"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { MeetingView, MyMeetingsResponse } from "@/utils/meeting-views";
import { EventContext, UserContext } from "../context";

type MyMeetings = {
  /** Null while the answer is still on its way, so "none" and "not yet" differ. */
  meetings: MeetingView[] | null;
  /** The slots the viewer declared themselves open for; null as above. */
  availability: string[] | null;
  reload: () => void;
};

// Shared so a guest with nothing to fetch gets a stable value rather than a
// new object on every render.
const NONE: MyMeetingsResponse = { meetings: [], availability: [] };

const MeetingsContext = createContext<MyMeetings>({
  meetings: null,
  availability: null,
  reload: () => {},
});

/**
 * The viewer's own 1-on-1s at the event in context, fetched once for whoever
 * needs them — the schedule's column and the modal it opens, which must agree
 * about a meeting the modal has just answered.
 *
 * Starts from the server render's copy, as RSVPs do, and refetches on mount:
 * the layout holding that copy survives client-side navigation, so it can be
 * stale by the time the schedule mounts again.
 */
export function MeetingsProvider({ children }: { children: ReactNode }) {
  const { event, myMeetings: seed } = useContext(EventContext);
  const { user } = useContext(UserContext);
  const [loaded, setLoaded] = useState<
    ({ key: string } & MyMeetingsResponse) | null
  >(() =>
    event && seed
      ? {
          key: `${event.id}:${seed.guestId}`,
          meetings: seed.meetings,
          availability: seed.availability,
        }
      : null
  );
  // Bumped by reload() to re-run the fetch below.
  const [reloads, setReloads] = useState(0);

  const eventId = event?.id;
  // A kiosk with nobody picked has nothing to fetch. An event with meetings
  // switched off still might: a request outlives the switch, and the one its
  // notification opens has to load.
  const key = eventId && user ? `${eventId}:${user}` : null;

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    void fetch(`/api/meetings?event=${eventId}`, { signal: controller.signal })
      .then((res) =>
        res.ok ? (res.json() as Promise<MyMeetingsResponse>) : NONE
      )
      .then((mine) => setLoaded({ key, ...mine }))
      // Aborted on unmount or on switching names, and the browser kills it
      // when the page goes; either way there is nobody left to tell.
      .catch(() => undefined);
    return () => controller.abort();
  }, [eventId, key, reloads]);

  const reload = useCallback(() => setReloads((n) => n + 1), []);

  // Keyed rather than cleared in an effect, so switching names never shows
  // the previous guest's meetings while the new answer is in flight. With
  // nothing to fetch the answer is "none", not "not yet".
  const mine = key === null ? NONE : loaded?.key === key ? loaded : null;

  return (
    <MeetingsContext.Provider
      value={{
        meetings: mine?.meetings ?? null,
        availability: mine?.availability ?? null,
        reload,
      }}
    >
      {children}
    </MeetingsContext.Provider>
  );
}

export function useMyMeetings(): MyMeetings {
  return useContext(MeetingsContext);
}
