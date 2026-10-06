import { z } from "zod";
import { COHOST_WANTED_NOTE_MAX } from "@schellingboard/domain/session";

export const sessionProposalSchema = z.object({
  eventId: z.string().min(1),
  eventSlug: z.string().min(1),
  title: z.string().trim().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  hostIds: z.string().array().default([]),
  durationMinutes: z.number().optional(),
  cohostWanted: z.boolean().default(false),
  cohostWantedNote: z
    .string()
    .trim()
    .max(COHOST_WANTED_NOTE_MAX, {
      message: `Keep it under ${COHOST_WANTED_NOTE_MAX} characters`,
    })
    .optional(),
});

// An update reuses the create payload minus eventId: a proposal can't be moved
// to another event, so the event is taken from the stored proposal rather than
// the request. The edit form still submits every remaining field, so an update
// is a full replacement validated exactly like a creation (e.g. title stays
// required) — there is no partial-update path to model here.
export const sessionProposalUpdateSchema = sessionProposalSchema
  .omit({ eventId: true })
  .extend({
    // The proposal's updatedTime when the form loaded it. A full replacement
    // from an older copy would undo what happened since, such as a co-host joining.
    expectedUpdatedTime: z.iso.datetime(),
  });

export const STALE_PROPOSAL_MESSAGE =
  "Someone changed this proposal while you edited it. Copy your edits somewhere safe: reloading the page discards them.";

const instant = z.iso.datetime({ offset: true });

export const sessionViewSchema = z
  .object({
    id: z.string(),
    eventId: z.string(),
    title: z.string(),
    description: z.string(),
    startTime: instant.nullable(),
    endTime: instant.nullable(),
    capacity: z.number().int(),
    adminManaged: z.boolean(),
    blocker: z.boolean(),
    closed: z.boolean(),
    proposalId: z.string().nullable(),
    hosts: z.array(z.object({ id: z.string(), name: z.string() })),
    locations: z.array(
      z.object({ id: z.string(), name: z.string(), color: z.string() })
    ),
    numRsvps: z.number().int(),
  })
  .meta({ id: "Session" });

export const sessionListSchema = z.object({
  sessions: z.array(sessionViewSchema),
});

const bookingFields = {
  dayId: z.string().min(1),
  title: z.string(),
  description: z.string().default(""),
  closed: z.boolean().default(false),
  hostIds: z.array(z.string()),
  startTime: instant.describe(
    "Start of the slot picked; the session starts after the event's break"
  ),
  durationMinutes: z.number().int().positive(),
  capacity: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Attendee maximum, 0 for none; absent takes the room's"),
  proposalId: z.string().min(1).optional(),
};

export const sessionCreateSchema = z.object({
  ...bookingFields,
  locationId: z.string().min(1),
});

export const sessionUpdateSchema = z.object({
  ...bookingFields,
  locationIds: z.array(z.string()).min(1),
});

const adminFields = {
  title: z.string(),
  description: z.string(),
  startTime: instant.nullable(),
  endTime: instant.nullable(),
  capacity: z.number().int().min(0),
  adminManaged: z.boolean(),
  blocker: z.boolean(),
  closed: z.boolean(),
  hostIds: z.array(z.string()),
  locationIds: z.array(z.string()),
};

export const adminSessionCreateSchema = z.object({
  ...adminFields,
  description: adminFields.description.default(""),
  capacity: adminFields.capacity.default(0),
  adminManaged: adminFields.adminManaged.default(false),
  blocker: adminFields.blocker.default(false),
  closed: adminFields.closed.default(false),
  hostIds: adminFields.hostIds.default([]),
  locationIds: adminFields.locationIds.default([]),
  eventId: z.string().min(1),
});

// A replacement: a field left out is refused, not reset to a default.
export const adminSessionUpdateSchema = z.object(adminFields);
