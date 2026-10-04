import type { z } from "zod";
import type {
  dayViewSchema,
  eventViewSchema,
} from "@schellingboard/contracts/event";
import type { Day, Event } from "@schellingboard/domain/event";

const iso = (d: Date | undefined) => d?.toISOString() ?? null;

export function toEventView(e: Event): z.input<typeof eventViewSchema> {
  return {
    id: e.id,
    slug: e.slug,
    name: e.name,
    description: e.description,
    website: e.website,
    timezone: e.timezone,
    maxSessionDuration: e.maxSessionDuration,
    breakMinutes: e.breakMinutes,
    slotIncrementMinutes: e.slotIncrementMinutes,
    rsvpCapacityHardLimit: e.rsvpCapacityHardLimit,
    icon: e.icon ?? null,
    meetingsEnabled: e.meetingsEnabled,
    maxOpenMeetingRequests: e.maxOpenMeetingRequests,
    firstDayStart: iso(e.firstDayStart),
    lastDayStart: iso(e.lastDayStart),
    proposalPhaseStart: iso(e.proposalPhaseStart),
    proposalPhaseEnd: iso(e.proposalPhaseEnd),
    votingPhaseStart: iso(e.votingPhaseStart),
    votingPhaseEnd: iso(e.votingPhaseEnd),
    schedulingPhaseStart: iso(e.schedulingPhaseStart),
    schedulingPhaseEnd: iso(e.schedulingPhaseEnd),
  };
}

export function toDayView(d: Day): z.input<typeof dayViewSchema> {
  return {
    id: d.id,
    eventId: d.eventId,
    start: d.start.toISOString(),
    end: d.end.toISOString(),
    startBookings: d.startBookings.toISOString(),
    endBookings: d.endBookings.toISOString(),
  };
}
