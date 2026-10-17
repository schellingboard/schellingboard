import type { Repositories } from "@/db/container";

export const sessionsOfEvent = (
  q: Pick<Repositories, "sessions">,
  eventId: string
) => q.sessions.listByEvent(eventId);

export const hostedSessions = (
  q: Pick<Repositories, "sessions">,
  guestId: string
) => q.sessions.listHostedByGuest(guestId);

type SessionRepo = Repositories["sessions"];

export const searchSessions = (
  q: Pick<Repositories, "sessions">,
  eventId: string,
  opts: Parameters<SessionRepo["searchByEvent"]>[1]
) => q.sessions.searchByEvent(eventId, opts);

export const scheduledSessions = (
  q: Pick<Repositories, "sessions">,
  eventId: string
) => q.sessions.listScheduledByEvent(eventId);

export const rsvpsOfSessions = (
  q: Pick<Repositories, "rsvps">,
  sessionIds: string[]
) => q.rsvps.listBySessions(sessionIds);

export const unavailabilityOfEvent = (
  q: Pick<Repositories, "locationUnavailability">,
  eventId: string
) => q.locationUnavailability.listByEvent(eventId);
