import { z } from "zod";

export const newPasswordSchema = z
  .string()
  .min(8, { message: "Use at least 8 characters" })
  .max(200);

export const chooseGuestBodySchema = z.object({
  guestId: z.string().min(1).describe("The guest to act as"),
});

export const identitySchema = z.object({
  guestId: z
    .string()
    .nullable()
    .describe("The guest the browser now acts as, or null when signed out"),
});

export const currentIdentitySchema = identitySchema.extend({
  awaitingLogin: z
    .boolean()
    .optional()
    .describe(
      "True when the browser holds a protected name it has not logged in to"
    ),
});
