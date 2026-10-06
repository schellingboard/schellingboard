import { z } from "zod";

export const rsvpViewSchema = z
  .object({
    id: z.string(),
    sessionId: z.string(),
    guestId: z.string(),
  })
  .meta({ id: "Rsvp" });

export const rsvpListSchema = z.object({ rsvps: z.array(rsvpViewSchema) });
