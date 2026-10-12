import type { Repositories } from "@/db/container";

export const sessionsOfEvent = (
  q: Pick<Repositories, "sessions">,
  eventId: string
) => q.sessions.listByEvent(eventId);

export const hostedSessions = (
  q: Pick<Repositories, "sessions">,
  guestId: string
) => q.sessions.listHostedByGuest(guestId);
