import type { Day } from "@schellingboard/domain/event";
import type { Location } from "@schellingboard/domain/location";
import type { Session } from "@schellingboard/domain/session";
import { sessionPassesFilters, type ScheduleFilter } from "./filters";
import { meetingsForDay } from "./meeting-column";
import type { MeetingView } from "./meeting-view";
import { meetingMatchesSearch, sessionMatchesSearch } from "./search";

export type DayWithSessions = Day & { sessions: Session[] };

export type ScheduleMatch = {
  filtering: boolean;
  matchesSession: (session: Session) => boolean;
  matchesMeeting: (meeting: MeetingView) => boolean;
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
  filters: readonly ScheduleFilter[];
  guestId: string | null;
  rsvpd: (sessionId: string) => boolean;
}): ScheduleMatch {
  const { search, guestId, rsvpd } = input;
  const filters = guestId ? input.filters : [];
  const searching = search.trim() !== "";
  return {
    filtering: searching || filters.length > 0,
    matchesSession: (session) =>
      !session.blocker &&
      (!searching || sessionMatchesSearch(session, search)) &&
      sessionPassesFilters(filters, {
        rsvpd: rsvpd(session.id),
        hosting: session.hosts.some((h) => h.id === guestId),
      }),
    matchesMeeting: (meeting) =>
      !searching || meetingMatchesSearch(meeting, search),
  };
}

export type ScheduleEntry = {
  day: DayWithSessions;
  total: number;
  sessions: Session[];
  meetings: MeetingView[];
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
      total: sessions.filter((s) => !s.blocker).length + dayMeetings.length,
      sessions: match.filtering
        ? sessions.filter(match.matchesSession)
        : sessions,
      meetings: match.filtering
        ? dayMeetings.filter(match.matchesMeeting)
        : dayMeetings,
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
