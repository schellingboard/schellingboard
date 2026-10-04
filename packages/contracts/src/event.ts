import { z } from "zod";
import { EVENT_ICON_NAMES } from "@schellingboard/domain/event-icons";
import { SLOT_INCREMENT_OPTIONS } from "@schellingboard/domain/slots";

const instant = z.iso.datetime({ offset: true });

export const eventSettingsBodySchema = z.object({
  name: z.string(),
  description: z.string().default(""),
  website: z.string().default(""),
  timezone: z
    .string()
    .default("UTC")
    .describe("IANA time zone the event's times are shown in"),
  maxSessionDuration: z.number().int().describe("Minutes"),
  breakMinutes: z
    .number()
    .int()
    .describe("Break before each session, in minutes"),
  slotIncrementMinutes: z
    .number()
    .int()
    .describe(`One of ${SLOT_INCREMENT_OPTIONS.join(", ")}`),
  rsvpCapacityHardLimit: z.boolean().default(false),
  icon: z.enum(EVENT_ICON_NAMES).nullable().optional(),
});

const phaseDate = instant.nullable().describe("null clears it");

export const eventPhasesBodySchema = z.object({
  proposalPhaseStart: phaseDate,
  proposalPhaseEnd: phaseDate,
  votingPhaseStart: phaseDate,
  votingPhaseEnd: phaseDate,
  schedulingPhaseStart: phaseDate,
  schedulingPhaseEnd: phaseDate,
});

export const eventViewSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  website: z.string(),
  timezone: z.string(),
  maxSessionDuration: z.number().int(),
  breakMinutes: z.number().int(),
  slotIncrementMinutes: z.number().int(),
  rsvpCapacityHardLimit: z.boolean(),
  icon: z.string().nullable(),
  meetingsEnabled: z.boolean(),
  maxOpenMeetingRequests: z.number().int(),
  firstDayStart: instant.nullable(),
  lastDayStart: instant.nullable(),
  ...eventPhasesBodySchema.shape,
});

export const eventListSchema = z.object({ events: z.array(eventViewSchema) });

export const dayBodySchema = z.object({
  start: instant,
  end: instant,
  startBookings: instant.describe("When sessions may start"),
  endBookings: instant.describe("When sessions must end"),
});

export const dayViewSchema = dayBodySchema.extend({
  id: z.string(),
  eventId: z.string(),
});

export const eventDetailSchema = z.object({
  event: eventViewSchema,
  days: z.array(dayViewSchema),
});
