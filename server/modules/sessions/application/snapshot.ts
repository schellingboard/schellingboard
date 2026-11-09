import type { Repositories } from "@/db/container";

export async function eventSessions(
  q: Pick<
    Repositories,
    "sessions" | "locationUnavailability" | "rsvps" | "sessionMarks"
  >,
  eventId: string,
  viewerId: string | null
) {
  const [sessions, unavailability, rsvps, marks] = await Promise.all([
    q.sessions.listByEvent(eventId),
    q.locationUnavailability.listByEvent(eventId),
    viewerId ? q.rsvps.listByGuest(viewerId) : [],
    viewerId ? q.sessionMarks.listByGuest(viewerId) : [],
  ]);
  const ids = new Set(sessions.map((s) => s.id));
  return {
    sessions,
    unavailability,
    rsvps: rsvps.filter((r) => ids.has(r.sessionId)),
    marks: marks.filter((m) => ids.has(m.sessionId)),
  };
}
