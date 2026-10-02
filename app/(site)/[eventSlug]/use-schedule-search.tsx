"use client";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentProps,
  type RefObject,
} from "react";
import { useSearchParams } from "next/navigation";
import type { Location, Session } from "@/db/repositories/interfaces";
import type { MeetingView } from "@/utils/meeting-views";
import { EventContext, UserContext, type DayWithSessions } from "../context";
import { meetingsForDay } from "@/utils/meeting-column";
import {
  meetingMatchesSearch,
  sessionMatchesSearch,
} from "@/utils/schedule-search";
import {
  parseScheduleFilters,
  SCHEDULE_FILTERS,
  serializeScheduleFilters,
  sessionPassesFilters,
  type ScheduleFilter,
} from "@/utils/schedule-filters";
import type { ScheduleFilters } from "./schedule-filters";
import { useMyMeetings } from "./use-meetings";

const NO_FILTERS: ScheduleFilter[] = [];

export type ScheduleMatch = {
  filtering: boolean;
  matchesSession: (session: Session) => boolean;
  matchesMeeting: (meeting: MeetingView) => boolean;
  /** The match last stepped to, marked out among the others. */
  currentMatchId?: string | null;
};

export const ScheduleMatchContext = createContext<ScheduleMatch>({
  filtering: false,
  matchesSession: () => true,
  matchesMeeting: () => true,
});

export const useScheduleMatch = () => useContext(ScheduleMatchContext);

/** What the grid draws in place of anything a search or filter passes over. */
export const GHOST_CLASS =
  "opacity-30 grayscale transition-opacity hover:opacity-70";

/** Drawn inside the block: its wrappers clip anything outside. */
export const CURRENT_MATCH_CLASS =
  "outline-3 outline-brand-accent -outline-offset-3";

/**
 * The search and filter chips shared by the schedule views: what matches,
 * each day's share of it, and the props for their ScheduleFilters bar.
 */
export function useScheduleSearch(input: {
  days: DayWithSessions[];
  locations: Location[];
  search: string;
  debouncedSearch: string;
  onSearchChange: (search: string) => void;
  scrollerRef: RefObject<HTMLDivElement | null>;
}) {
  const {
    days,
    locations,
    search,
    debouncedSearch,
    onSearchChange,
    scrollerRef,
  } = input;
  const searchParams = useSearchParams();
  const { user } = useContext(UserContext);
  const { rsvpdForSession } = useContext(EventContext);
  const { meetings } = useMyMeetings();
  const [chosenFilters, setChosenFilters] = useState(() =>
    parseScheduleFilters(searchParams.get("filter"))
  );
  const filters = user ? chosenFilters : NO_FILTERS;
  const searching = debouncedSearch.trim() !== "";
  const filtering = searching || filters.length > 0;
  const setFilters = (next: ScheduleFilter[]) => {
    setChosenFilters(next);
    const params = new URLSearchParams(window.location.search);
    const serialized = serializeScheduleFilters(next);
    if (serialized) params.set("filter", serialized);
    else params.delete("filter");
    // Not router.replace: the filter is the browser's alone, and a server
    // round trip per tap lands late enough to race the next one.
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname
    );
  };

  const matchesSession = useCallback(
    (s: Session) =>
      !s.blocker &&
      (!searching || sessionMatchesSearch(s, debouncedSearch)) &&
      sessionPassesFilters(filters, {
        rsvpd: rsvpdForSession(s.id),
        hosting: s.hosts.some((h) => h.id === user),
      }),
    [searching, debouncedSearch, filters, rsvpdForSession, user]
  );
  // The viewer's own 1-on-1s are theirs under every filter.
  const matchesMeeting = useCallback(
    (m: MeetingView) => !searching || meetingMatchesSearch(m, debouncedSearch),
    [searching, debouncedSearch]
  );
  const match = useMemo(
    () => ({ filtering, matchesSession, matchesMeeting }),
    [filtering, matchesSession, matchesMeeting]
  );

  const entries = useMemo(() => {
    const locParams = searchParams?.getAll("loc") ?? [];
    const locationsFromParams = locations.filter((loc) =>
      locParams.includes(loc.name)
    );
    const includedLocations =
      locationsFromParams.length === 0 ? locations : locationsFromParams;
    return days.map((day) => {
      const sessions = day.sessions.filter((session) =>
        includedLocations.some((loc) =>
          session.locations.some((l) => l.id === loc.id)
        )
      );
      const dayMeetings = meetingsForDay(meetings ?? [], day);
      return {
        day,
        total: sessions.filter((s) => !s.blocker).length + dayMeetings.length,
        sessions: filtering ? sessions.filter(matchesSession) : sessions,
        meetings: filtering ? dayMeetings.filter(matchesMeeting) : dayMeetings,
      };
    });
  }, [
    days,
    locations,
    searchParams,
    meetings,
    filtering,
    matchesSession,
    matchesMeeting,
  ]);

  const count = filtering
    ? entries.reduce(
        (acc, e) => ({
          matching: acc.matching + e.sessions.length + e.meetings.length,
          total: acc.total + e.total,
        }),
        { matching: 0, total: 0 }
      )
    : null;

  const [statusLine, setStatusLine] = useState<HTMLDivElement | null>(null);
  const [measuredHeight, setStatusHeight] = useState(0);
  const statusHeight = statusLine ? measuredHeight : 0;
  useLayoutEffect(() => {
    if (!statusLine) return;
    const observer = new ResizeObserver(() =>
      setStatusHeight(statusLine.offsetHeight)
    );
    observer.observe(statusLine);
    return () => observer.disconnect();
  }, [statusLine]);

  const barProps: ComponentProps<typeof ScheduleFilters> = {
    statusRef: setStatusLine,
    search,
    onSearchChange,
    filters: user
      ? SCHEDULE_FILTERS.map((f) => ({
          ...f,
          active: filters.includes(f.value),
        }))
      : null,
    onToggleFilter: (value) =>
      setFilters(
        filters.includes(value)
          ? filters.filter((f) => f !== value)
          : [...filters, value]
      ),
    count,
    onShowAll: () => {
      onSearchChange("");
      setFilters([]);
    },
    onBackToTop: () =>
      scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
  };

  // Changes whenever the set of matches may have, which ends any stepping.
  const matchKey = `${debouncedSearch}|${filters.join()}`;

  return { match, filtering, entries, statusHeight, barProps, matchKey };
}
