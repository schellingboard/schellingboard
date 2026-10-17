import { z } from "zod";
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
      type: z.literal("session.changed"),
      session: snapshotSessionSchema,
    }),
    z.object({
      ...common,
      type: z.literal("session.deleted"),
      sessionId: z.string(),
    }),
  ])
  .meta({ id: "FeedMessage" });

export type FeedMessage = z.infer<typeof feedMessageSchema>;
