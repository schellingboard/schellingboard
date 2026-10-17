import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { newestSeq } from "@/server/kernel/change-log";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";
import {
  eventScheduleBySlug,
  toDayView,
  toEventView,
} from "@/server/modules/events/module";
import {
  eventMeetings,
  toMeetingPointView,
  toMeetingView,
} from "@/server/modules/meetings/module";
import { eventGuests, toEventGuestView } from "@/server/modules/people/module";
import {
  eventSessions,
  toSessionView,
  toUnavailabilityView,
} from "@/server/modules/sessions/module";
import { eventLocations, toLocationView } from "@/server/modules/venue/module";

type SnapshotReads = Parameters<typeof eventScheduleBySlug>[0] &
  Parameters<typeof eventSessions>[0] &
  Parameters<typeof eventLocations>[0] &
  Parameters<typeof eventGuests>[0] &
  Parameters<typeof eventMeetings>[0] &
  Parameters<typeof newestSeq>[0];

/**
 * The event's schedule as `viewerId` may see it (ADR 0014 section 7), read on
 * one view with the `seq` the feed resumes after.
 */
export function readSnapshot(
  uow: UnitOfWork,
  slug: string,
  viewerId: string | null
): Promise<Snapshot | undefined> {
  return uow.read((q) => assemble(q, slug, viewerId));
}

async function assemble(
  q: SnapshotReads,
  slug: string,
  viewerId: string | null
): Promise<Snapshot | undefined> {
  const schedule = await eventScheduleBySlug(q, slug);
  if (!schedule) return undefined;
  const eventId = schedule.event.id;
  const [seq, sessions, locations, guests, meetings] = await Promise.all([
    newestSeq(q),
    eventSessions(q, eventId, viewerId),
    eventLocations(q, eventId),
    eventGuests(q, eventId),
    eventMeetings(q, eventId, viewerId),
  ]);
  const counts: Record<string, number> = {};
  const sessionViews = sessions.sessions.map((s) => {
    const { hosts, locations, numRsvps, ...view } = toSessionView(s);
    counts[s.id] = numRsvps;
    return {
      ...view,
      hostIds: hosts.map((h) => h.id),
      locationIds: locations.map((l) => l.id),
    };
  });

  return {
    seq,
    event: toEventView(schedule.event),
    days: schedule.days.map(toDayView),
    locations: locations.map(toLocationView),
    unavailability: sessions.unavailability.map(toUnavailabilityView),
    guests: guests.map(toEventGuestView),
    sessions: sessionViews,
    counts,
    meetingPoints: meetings.meetingPoints.map(toMeetingPointView),
    me: viewerId
      ? {
          guestId: viewerId,
          rsvps: sessions.rsvps.map(({ id, sessionId, guestId }) => ({
            id,
            sessionId,
            guestId,
          })),
          meetings: meetings.meetings.map(toMeetingView),
          meetingGuests: meetings.partners.map(toEventGuestView),
          availability: meetings.availability.map((d) => d.toISOString()),
        }
      : null,
  };
}
