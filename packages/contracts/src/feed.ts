import { z } from "zod";
import { dayViewSchema, eventViewSchema } from "./event";
import { unavailabilityViewSchema } from "./location";
import { rsvpViewSchema } from "./rsvp";
import { snapshotLocationSchema, snapshotSessionSchema } from "./snapshot";

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
      type: z.literal("event.changed"),
      event: eventViewSchema,
    }),
    z.object({ ...common, type: z.literal("event.deleted") }),
    z.object({
      ...common,
      type: z.literal("day.created"),
      day: dayViewSchema,
    }),
    z.object({
      ...common,
      type: z.literal("day.changed"),
      day: dayViewSchema,
    }),
    z.object({
      ...common,
      type: z.literal("day.deleted"),
      dayId: z.string(),
    }),
    z.object({
      ...common,
      type: z.literal("location.changed"),
      location: snapshotLocationSchema,
    }),
    z.object({
      ...common,
      type: z.literal("location.removed"),
      locationId: z.string(),
    }),
    z.object({
      ...common,
      type: z.literal("unavailability.added"),
      period: unavailabilityViewSchema,
    }),
    z.object({
      ...common,
      type: z.literal("unavailability.removed"),
      periodId: z.string(),
    }),
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
