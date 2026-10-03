import { z } from "zod";

// The lengths are the only bound on two free-text fields that are stored
// verbatim and shown to the recipient; they are generous rather than tuned.
export const meetingRequestSchema = z.object({
  eventId: z.string(),
  recipientId: z.string(),
  slotStart: z.string(),
  slotCount: z.number().int().min(1).default(1),
  meetingPoint: z.string().max(200),
  message: z.string().max(2000).optional(),
});

export const meetingRespondSchema = z.object({
  meetingId: z.string(),
  response: z.enum(["accept", "decline"]),
});

export const meetingCancelSchema = z.object({
  meetingId: z.string(),
  note: z.string().max(2000).optional(),
});

export const meetingAvailabilitySchema = z.object({
  eventId: z.string(),
  slotStarts: z.array(z.string()),
});
