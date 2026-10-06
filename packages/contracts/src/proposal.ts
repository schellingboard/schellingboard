import { z } from "zod";
import { sessionProposalSchema } from "./session";

const instant = z.iso.datetime({ offset: true });
const pct = z.number().nullable();

export const voteBreakdownSchema = z
  .object({
    attendees: z.number().int(),
    interested: z.number().int(),
    maybe: z.number().int(),
    skip: z.number().int(),
    votes: z.number().int(),
    votesPctOfAttendees: pct,
    nonVoters: z.number().int(),
    nonVotersPctOfAttendees: pct,
    interestedPctOfVotes: pct,
    maybePctOfVotes: pct,
    skipPctOfVotes: pct,
    estimatedAttendance: z
      .object({ low: z.number().int(), high: z.number().int() })
      .nullable()
      .describe("A very rough 50% range of how many people to expect"),
    noEstimateReason: z
      .enum(["low-turnout", "no-interest", "unknown-event"])
      .nullable(),
  })
  .describe(
    "From the scheduling phase on, shown to a proposal's hosts, and to everyone for a proposal nobody hosts"
  );

export const proposalViewSchema = z
  .object({
    id: z.string(),
    eventId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    durationMinutes: z.number().nullable(),
    createdTime: instant,
    updatedTime: instant,
    hosts: z.array(z.object({ id: z.string(), name: z.string() })),
    cohostWanted: z.boolean(),
    cohostWantedNote: z.string().nullable(),
    sessionIds: z.array(z.string()),
    tally: z
      .object({ interested: z.number().int(), maybe: z.number().int() })
      .nullable()
      .describe(
        "The public tally, from the scheduling phase on; skip votes are only in the breakdown"
      ),
    breakdown: voteBreakdownSchema.nullable(),
  })
  .meta({ id: "Proposal" });

export const proposalListSchema = z.object({
  proposals: z.array(proposalViewSchema),
});

export const proposalCreateSchema = sessionProposalSchema
  .omit({ eventSlug: true })
  .extend({ durationMinutes: z.number().int().min(0).optional() });

export const proposalUpdateSchema = proposalCreateSchema
  .omit({ eventId: true })
  .extend({
    expectedUpdatedTime: instant.describe(
      "The proposal's updatedTime when it was read; a later change refuses the edit"
    ),
  });

export const adminProposalUpdateSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  durationMinutes: z.number().int().min(0).nullable().default(null),
  hostIds: z.array(z.string()).default([]),
  expectedUpdatedTime: instant,
});

export const adminProposalCreateSchema = adminProposalUpdateSchema
  .omit({ expectedUpdatedTime: true })
  .extend({ eventId: z.string().min(1) });
