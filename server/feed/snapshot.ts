import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { newestSeq } from "@/server/kernel/change-log";
import { notFound, ok, type Result } from "@/server/kernel/result";
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
  toSnapshotSessionView,
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
 * The event's schedule as `actor` may see it (ADR 0014 section 7), read on one
 * view with the `seq` the feed resumes after. The API and the SSR layout share
 * it, so both apply one rule for whose `me` a cookie gets.
 */
export function snapshotFor(
  uow: UnitOfWork,
  actor: Actor,
  slug: string,
  now: Date
): Promise<Result<Snapshot>> {
  return uow.read(async (q) => {
    const viewer = await actingGuest(actor, q.guests);
    const snapshot = await assemble(
      q,
      slug,
      viewer.ok ? viewer.value : null,
      now
    );
    return snapshot
      ? ok(snapshot)
      : notFound("event.notFound", "Event not found");
  });
}

async function assemble(
  q: SnapshotReads,
  slug: string,
  viewerId: string | null,
  now: Date
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
  return {
    seq,
    now: now.toISOString(),
    event: toEventView(schedule.event),
    days: schedule.days.map(toDayView),
    locations: locations.map(toLocationView),
    unavailability: sessions.unavailability.map(toUnavailabilityView),
    guests: guests.map((g) => ({ ...toEventGuestView(g), member: g.member })),
    sessions: sessions.sessions.map(toSnapshotSessionView),
    counts: Object.fromEntries(
      sessions.sessions.map((s) => [s.id, s.numRsvps])
    ),
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
