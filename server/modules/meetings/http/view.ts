import type {
  meetingPointSchema,
  meetingSchema,
} from "@schellingboard/contracts/meeting";
import type { Meeting, MeetingPoint } from "@schellingboard/domain/meeting";
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

export function toMeetingPointView(
  p: MeetingPoint
): z.input<typeof meetingPointSchema> {
  return {
    id: p.id,
    eventId: p.eventId,
    name: p.name,
    description: p.description,
    sortIndex: p.sortIndex,
    version: p.version,
  };
}
