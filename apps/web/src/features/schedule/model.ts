import type { Day, SharedMoment } from "@schellingboard/domain/event";
import type { Location } from "@schellingboard/domain/location";
import type { Session } from "@schellingboard/domain/session";
import { sessionPassesFilters, type ScheduleFilterState } from "./filters";
import { meetingsForDay } from "./meeting-column";
import type { MeetingView } from "./meeting-view";
import { meetingMatchesSearch, sessionMatchesSearch } from "./search";

export type DayWithSessions = Day & {
  sessions: Session[];
  moments: SharedMoment[];
};

export type ScheduleMatch = {
  filtering: boolean;
  matchesSession: (session: Session) => boolean;
  /** Hidden by the viewer, and not being looked for with the Hidden chip. */
  hides: (session: Session) => boolean;
  matchesMeeting: (meeting: MeetingView) => boolean;
  /** Shared moments stay in lists, even in My schedule, but not under a search,
   * Hidden or Clashes. */
  showsMoments: boolean;
};

/** Every room, unless `?loc=` names some that exist. */
export function includedLocations(
  locations: Location[],
  locParams: string[]
): Location[] {
  const chosen = locations.filter((loc) => locParams.includes(loc.name));
  return chosen.length === 0 ? locations : chosen;
}

/**
 * What a search and the viewer's filter chips let through. Filters mean
 * nothing without a viewer, and the viewer's own 1-on-1s are theirs under
 * every filter.
 */
export function createScheduleMatch(input: {
  search: string;
  filters: ScheduleFilterState;
  guestId: string | null;
  rsvpd: (sessionId: string) => boolean;
  bookmarked: (sessionId: string) => boolean;
  hidden: (sessionId: string) => boolean;
  /** A session or 1-on-1 the Clashes chip lists. */
  clashing: (id: string) => boolean;
}): ScheduleMatch {
  const { search, guestId, rsvpd, bookmarked, clashing } = input;
  const hidden = guestId ? input.hidden : () => false;
  const filters: ScheduleFilterState = guestId ? input.filters : { mine: null };
  const hiddenOnly = !!filters.hidden;
  const searching = search.trim() !== "";
  return {
    filtering:
      searching || filters.mine !== null || hiddenOnly || !!filters.clashes,
    showsMoments: !searching && !hiddenOnly && !filters.clashes,
    hides: (session) => !hiddenOnly && hidden(session.id),
    matchesSession: (session) =>
      !session.blocker &&
      (!searching || sessionMatchesSearch(session, search)) &&
      hidden(session.id) === hiddenOnly &&
      (!filters.clashes || clashing(session.id)) &&
      sessionPassesFilters(filters, {
        rsvpd: rsvpd(session.id),
        hosting: session.hosts.some((h) => h.id === guestId),
        bookmarked: bookmarked(session.id),
      }),
    matchesMeeting: (meeting) =>
      (!searching || meetingMatchesSearch(meeting, search)) &&
      (!filters.clashes || clashing(meeting.id)),
  };
}

export type ScheduleEntry = {
  day: DayWithSessions;
  total: number;
  sessions: Session[];
  meetings: MeetingView[];
  moments: SharedMoment[];
};

export function scheduleEntries(input: {
  days: DayWithSessions[];
  locations: Location[];
  locParams: string[];
  meetings: MeetingView[];
  match: ScheduleMatch;
}): ScheduleEntry[] {
  const { days, locations, locParams, meetings, match } = input;
  const rooms = includedLocations(locations, locParams);
  return days.map((day) => {
    const sessions = day.sessions.filter((session) =>
      rooms.some((room) => session.locations.some((l) => l.id === room.id))
    );
    const dayMeetings = meetingsForDay(meetings, day);
    return {
      day,
      total:
        sessions.filter((s) => !s.blocker && !match.hides(s)).length +
        dayMeetings.length,
      sessions: match.filtering
        ? sessions.filter(match.matchesSession)
        : sessions.filter((s) => !match.hides(s)),
      meetings: match.filtering
        ? dayMeetings.filter(match.matchesMeeting)
        : dayMeetings,
      moments: match.showsMoments ? day.moments : [],
    };
  });
}

/** How many entries match out of how many; null when nothing narrows them. */
export function countMatches(
  entries: ScheduleEntry[],
  match: Pick<ScheduleMatch, "filtering">
): { matching: number; total: number } | null {
  if (!match.filtering) return null;
  return entries.reduce(
    (acc, e) => ({
      matching: acc.matching + e.sessions.length + e.meetings.length,
      total: acc.total + e.total,
    }),
    { matching: 0, total: 0 }
  );
}

export type DayFold = { foldable: boolean; folded: boolean };

/** Grid: days without a match fold while filtering, passed days otherwise. */
export function gridDayFold(input: {
  dayId: string;
  filtering: boolean;
  empty: boolean;
  defaultFolded: ReadonlySet<string>;
  unfolded: ReadonlySet<string>;
  openedEmpty: ReadonlySet<string>;
}): DayFold {
  const { dayId, filtering, empty, defaultFolded, unfolded, openedEmpty } =
    input;
  if (filtering)
    return { foldable: empty, folded: empty && !openedEmpty.has(dayId) };
  const foldable = defaultFolded.has(dayId);
  return { foldable, folded: foldable && !unfolded.has(dayId) };
}

/** Agenda: a search looks through past days too, so it unfolds them. */
export function agendaDayFold(input: {
  dayId: string;
  filtering: boolean;
  defaultFolded: ReadonlySet<string>;
  unfolded: ReadonlySet<string>;
}): DayFold {
  const { dayId, filtering, defaultFolded, unfolded } = input;
  if (filtering) return { foldable: false, folded: false };
  const foldable = defaultFolded.has(dayId);
  return { foldable, folded: foldable && !unfolded.has(dayId) };
}
