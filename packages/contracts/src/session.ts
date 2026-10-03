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
