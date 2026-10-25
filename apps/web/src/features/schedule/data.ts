import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Event } from "@schellingboard/domain/event";
import type {
  Location,
  LocationUnavailability,
} from "@schellingboard/domain/location";
import { eventContextFrom } from "../../replica/selectors";
import type { Session } from "@schellingboard/domain/session";
import type { MeetingView } from "./meeting-view";
import { meetingViewsFrom } from "./meetings";
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
  guestId: string | null;
  guests: { id: string; name: string }[];
  rsvpd: (sessionId: string) => boolean;
  meetings: MeetingView[];
  availability: string[];
};

export function scheduleDataFrom(snapshot: Snapshot, now: Date): ScheduleData {
  const { event, days, sessions, locations, unavailability, rsvps } =
    eventContextFrom(snapshot);
  const rsvpdIds = new Set(rsvps.map((r) => r.sessionId));
  return {
    event,
    days,
    sessions,
    locations,
    unavailability,
    now,
    guestId: snapshot.me?.guestId ?? null,
    guests: snapshot.guests,
    rsvpd: (sessionId) => rsvpdIds.has(sessionId),
    meetings: meetingViewsFrom(snapshot, now),
    availability: snapshot.me?.availability ?? [],
  };
}
