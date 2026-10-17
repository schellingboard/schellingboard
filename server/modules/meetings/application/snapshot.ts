import type { Repositories } from "@/db/container";

export async function eventMeetings(
  q: Pick<
    Repositories,
    "meetingPoints" | "meetings" | "meetingAvailability" | "guests"
  >,
  eventId: string,
  viewerId: string | null
) {
  const [meetingPoints, meetings, availability] = await Promise.all([
    q.meetingPoints.listByEvent(eventId),
    viewerId ? q.meetings.listByGuestAndEvent(viewerId, eventId) : [],
    viewerId
      ? q.meetingAvailability.listByGuestAndEvent(viewerId, eventId)
      : [],
  ]);
  const partnerIds = new Set(
    meetings.flatMap((m) => [m.requesterId, m.recipientId])
  );
  if (viewerId) partnerIds.delete(viewerId);
  const partners = await q.guests.listByIds([...partnerIds]);
  return { meetingPoints, meetings, availability, partners };
}
