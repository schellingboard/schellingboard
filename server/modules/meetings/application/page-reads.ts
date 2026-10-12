import type { Repositories } from "@/db/container";

export const meetingPointsOfEvent = (
  q: Pick<Repositories, "meetingPoints">,
  eventId: string
) => q.meetingPoints.listByEvent(eventId);
