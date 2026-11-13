import { LABEL_COLOR_NAMES } from "@schellingboard/domain/event-label";
import { z } from "zod";

export const eventLabelBodySchema = z.object({
  name: z.string().min(1).max(40),
  description: z.string().max(200).default(""),
  color: z.enum(LABEL_COLOR_NAMES),
});

export const eventLabelViewSchema = eventLabelBodySchema.extend({
  id: z.string(),
  eventId: z.string(),
  guestIds: z.array(z.string()).describe("Guests of the event wearing it"),
});

export const guestLabelsBodySchema = z.object({
  labelIds: z
    .array(z.string())
    .describe("All the labels the guest wears in this event"),
});
