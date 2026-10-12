import { z } from "zod";
import { rsvpViewSchema } from "./rsvp";
import { snapshotSessionSchema } from "./snapshot";

const common = {
  seq: z.number().int(),
  commandKey: z
    .string()
    .nullable()
    .describe("The Idempotency-Key of your own request that made it"),
};

export const feedMessageSchema = z
  .discriminatedUnion("type", [
    z.object({
      ...common,
      type: z.literal("session.created"),
      session: snapshotSessionSchema,
    }),
    z.object({
      ...common,
      type: z.literal("session.changed"),
      session: snapshotSessionSchema,
    }),
    z.object({
      ...common,
      type: z.literal("session.deleted"),
      sessionId: z.string(),
    }),
    z.object({
      ...common,
      type: z.literal("session.attendanceChanged"),
      sessionId: z.string(),
      numRsvps: z.number().int(),
    }),
    z.object({
      ...common,
      type: z.literal("rsvp.added"),
      rsvp: rsvpViewSchema,
    }),
    z.object({
      ...common,
      type: z.literal("rsvp.removed"),
      sessionId: z.string(),
      guestId: z.string(),
    }),
  ])
  .meta({ id: "FeedMessage" });

export type FeedMessage = z.infer<typeof feedMessageSchema>;
