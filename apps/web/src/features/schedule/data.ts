import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Event } from "@schellingboard/domain/event";
import type {
  Location,
  LocationUnavailability,
} from "@schellingboard/domain/location";
import { scheduleReadOnly } from "@schellingboard/domain/phase";
import { eventContextFrom } from "../../replica/selectors";
import type { Session } from "@schellingboard/domain/session";
import type { MeetingView } from "./meeting-view";
import { meetingViewsFrom } from "./meetings";
import { clashesAmong, meetingClashes, type Clash } from "./clashes";
import type { DayWithSessions } from "./model";

/** Everything the schedule draws, read from the replica at one instant. */
export type ScheduleData = {
  event: Event;
  days: DayWithSessions[];
  /** Every scheduled session of the event. */
  sessions: Session[];
  locations: Location[];
  unavailability: LocationUnavailability[];
  now: Date;
  /** Browsing only: no RSVP, free slots, Edit or Become host. */
  readOnly: boolean;
  guestId: string | null;
  /** Whether the viewer belongs to the event, not just hosts in it. */
  isMember: boolean;
  guests: { id: string; name: string }[];
  rsvpd: (sessionId: string) => boolean;
  bookmarked: (sessionId: string) => boolean;
  hasBookmarks: boolean;
  /** Marked hidden by the viewer, who has neither RSVP'd to nor hosts it. */
  hidden: (sessionId: string) => boolean;
  hasHidden: boolean;
  /** What a commitment (RSVP'd or hosted session) overlaps; bookmarks have none. */
  clashes: (sessionId: string) => Clash[];
  /** Whether the Clashes chip lists a session or 1-on-1, bookmarks included. */
  clashing: (id: string) => boolean;
  hasClashes: boolean;
  meetings: MeetingView[];
  availability: string[];
};

export function scheduleDataFrom(snapshot: Snapshot, now: Date): ScheduleData {
  const { event, days, sessions, locations, unavailability, rsvps } =
    eventContextFrom(snapshot);
  const rsvpdIds = new Set(rsvps.map((r) => r.sessionId));
  const bookmarkedIds = new Set(
    (snapshot.me?.marks ?? [])
      .filter((m) => m.kind === "bookmark")
      .map((m) => m.sessionId)
  );
  const hiddenIds = new Set(
    (snapshot.me?.marks ?? [])
      .filter((m) => m.kind === "hidden")
      .map((m) => m.sessionId)
      .filter(
        (id) =>
          !rsvpdIds.has(id) &&
          !sessions.some(
            (s) =>
              s.id === id && s.hosts.some((h) => h.id === snapshot.me?.guestId)
          )
      )
  );
  const meetings = meetingViewsFrom(snapshot, now);
  const guestId = snapshot.me?.guestId ?? null;
  const committed = sessions.filter(
    (s) => rsvpdIds.has(s.id) || s.hosts.some((h) => h.id === guestId)
  );
  const clashesOf = clashesAmong(committed, meetings);
  const listed = [
    ...committed,
    ...sessions.filter(
      (s) => bookmarkedIds.has(s.id) && !committed.includes(s)
    ),
  ];
  const clashingSessions = new Set(clashesAmong(listed, meetings).keys());
  const clashingIds = new Set([
    ...clashingSessions,
    ...meetingClashes(listed, meetings),
  ]);
  return {
    event,
    days,
    sessions,
    locations,
    unavailability,
    now,
    readOnly: scheduleReadOnly(event, now),
    guestId: snapshot.me?.guestId ?? null,
    isMember: snapshot.guests.some(
      (g) => g.id === snapshot.me?.guestId && g.member
    ),
    guests: snapshot.guests,
    rsvpd: (sessionId) => rsvpdIds.has(sessionId),
    bookmarked: (sessionId) => bookmarkedIds.has(sessionId),
    hasBookmarks: bookmarkedIds.size > 0,
    hidden: (sessionId) => hiddenIds.has(sessionId),
    hasHidden: hiddenIds.size > 0,
    meetings,
    clashes: (sessionId) => clashesOf.get(sessionId) ?? [],
    clashing: (id) => clashingIds.has(id),
    hasClashes: clashingSessions.size > 0,
    availability: snapshot.me?.availability ?? [],
  };
}
