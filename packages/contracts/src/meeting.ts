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

const instant = z.iso.datetime({ offset: true });
const meetingStatus = z.enum(["pending", "accepted", "declined", "canceled"]);

export const meetingSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  requesterId: z.string(),
  recipientId: z.string(),
  slotStart: instant,
  slotEnd: instant,
  meetingPoint: z.string(),
  message: z.string(),
  cancelNote: z.string(),
  status: meetingStatus,
  createdAt: instant,
  respondedAt: instant.nullable(),
});

const clashSchema = z
  .object({
    guestName: z.string(),
    kind: z.enum(["hosting", "attending", "meeting", "busy"]),
    title: z.string().nullable(),
    isViewer: z.boolean(),
  })
  .describe("Only the caller's own commitment is named; another's is busy");

export const meetingViewSchema = z
  .object({
    id: z.string(),
    status: z
      .enum([...meetingStatus.options, "expired"])
      .describe("expired: a request nobody answered before its slot began"),
    role: z
      .enum(["requester", "recipient"])
      .describe("Which side the caller is on; only a recipient can answer"),
    otherId: z.string(),
    otherName: z.string(),
    slotStart: instant,
    slotEnd: instant,
    dayLabel: z.string().describe("In the event's time zone"),
    timeLabel: z.string().describe("In the event's time zone"),
    meetingPoint: z.string(),
    message: z.string(),
    cancelNote: z
      .string()
      .describe("What the canceller said, if anything; empty otherwise"),
    clashes: z
      .array(clashSchema)
      .describe("Either party's commitments in the slot"),
  })
  .meta({ id: "Meeting" });

export const myMeetingsSchema = z.object({
  meetings: z.array(meetingViewSchema).describe("The caller's own, by slot"),
  availability: z
    .array(instant)
    .describe("The slot starts the caller declared themselves free"),
});

export const meetingCandidatesQuerySchema = z.object({
  eventId: z.string().min(1),
  slotStart: z.string().min(1),
  slotCount: z.coerce.number().int().min(1).default(1),
});

export const meetingCandidatesSchema = z.object({
  eventName: z.string(),
  dayLabel: z.string(),
  slotLabel: z.string(),
  slotCount: z.number().int(),
  lengths: z.array(
    z.object({ slotCount: z.number().int(), minutes: z.number() })
  ),
  meetingPoints: z.array(
    z.object({ id: z.string(), name: z.string(), description: z.string() })
  ),
  yourClashes: z.array(clashSchema),
  candidates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      pronouns: z.string().nullable(),
      basedIn: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      isHost: z.boolean(),
      busy: z
        .boolean()
        .describe("They have something then; what it is stays theirs"),
    })
  ),
});

export const meetingCancelBodySchema = meetingCancelSchema.omit({
  meetingId: true,
});

export const eventMeetingsSchema = z.object({
  meetingsEnabled: z.boolean(),
  maxOpenMeetingRequests: z
    .number()
    .int()
    .optional()
    .describe("Required, at least 1, when meetingsEnabled is true"),
});

export const meetingPointInputSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const meetingPointSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  description: z.string(),
  sortIndex: z.number().int(),
});
