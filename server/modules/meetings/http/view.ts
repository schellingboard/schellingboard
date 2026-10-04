import type { meetingSchema } from "@schellingboard/contracts/meeting";
import type { Meeting } from "@schellingboard/domain/meeting";
import type { z } from "zod";

export function toMeetingView(m: Meeting): z.input<typeof meetingSchema> {
  return {
    id: m.id,
    eventId: m.eventId,
    requesterId: m.requesterId,
    recipientId: m.recipientId,
    slotStart: m.slotStart.toISOString(),
    slotEnd: m.slotEnd.toISOString(),
    meetingPoint: m.meetingPoint,
    message: m.message,
    cancelNote: m.cancelNote,
    status: m.status,
    createdAt: m.createdAt.toISOString(),
    respondedAt: m.respondedAt?.toISOString() ?? null,
  };
}
