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

const identifierField = z
  .string()
  .min(1)
  .max(200)
  .optional()
  .describe("The guest's email or username, instead of `guestId`");

const exactlyOneTarget = (body: { guestId?: string; identifier?: string }) =>
  (body.guestId === undefined) !== (body.identifier === undefined);
const targetMessage = { message: "Send exactly one of guestId and identifier" };

export const siteLoginBodySchema = z.object({
  password: z.string().min(1).describe("The site password"),
});

export const loginCodeBodySchema = z
  .object({
    guestId: z.string().min(1).optional().describe("The guest to email a code"),
    identifier: identifierField,
  })
  .refine(exactlyOneTarget, targetMessage);

export const loginBodySchema = z
  .object({
    guestId: z.string().min(1).optional().describe("The guest to log in as"),
    identifier: identifierField,
    credential: z
      .string()
      .min(1)
      .max(200)
      .describe("The guest's password or a login code they were emailed"),
  })
  .refine(exactlyOneTarget, targetMessage);

export const resetLinkBodySchema = z
  .object({
    guestId: z.string().min(1).optional().describe("The guest to email a link"),
    identifier: identifierField,
  })
  .refine(exactlyOneTarget, targetMessage);

export const resetBodySchema = z.object({
  guestId: z.string().min(1),
  token: z.string().min(1).max(200).describe("The token in the emailed link"),
  newPassword: newPasswordSchema,
});

export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: newPasswordSchema,
});

export const unprotectBodySchema = z.object({
  currentPassword: z.string().min(1).max(200),
});

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9._-]{2,31}$/, {
    message:
      "Use 3 to 32 letters, digits, dots, dashes or underscores, starting with a letter or digit",
  });

export const usernameBodySchema = z.object({
  username: usernameSchema.nullable(),
});

const bootstrapTarget = (body: {
  guestId?: string;
  name?: string;
  email?: string;
}) =>
  body.guestId === undefined
    ? Boolean(body.name && body.email)
    : body.name === undefined && body.email === undefined;

export const bootstrapBodySchema = z
  .object({
    token: z
      .string()
      .min(1)
      .max(200)
      .describe("The token in the bootstrap link"),
    guestId: z
      .string()
      .min(1)
      .optional()
      .describe("An existing guest to make the site admin"),
    name: z.string().trim().min(1).max(200).optional(),
    email: z.string().trim().min(1).max(200).optional(),
    username: usernameSchema,
    password: newPasswordSchema,
  })
  .refine(bootstrapTarget, {
    message: "Send either guestId, or both name and email",
  });

export const usernameResultSchema = z.object({
  username: z.string().nullable(),
});

export const loginSessionSchema = z.object({
  id: z.string().describe("Names the session in DELETE; not the cookie value"),
  current: z.boolean().describe("True for this browser's own session"),
  assurance: z.enum(["claimed", "verified"]),
  device: z.string().nullable().describe("The browser's user agent, if known"),
  createdAt: z.string().describe("ISO instant"),
  lastSeenAt: z.string().describe("ISO instant"),
  expiresAt: z.string().describe("ISO instant"),
});

export const credentialsSchema = z.object({
  authProtected: z
    .boolean()
    .describe("Whether switching to the name asks for a login"),
  username: z.string().nullable(),
});

export const joinBodySchema = z.object({
  token: z.string().min(1).max(200).describe("The token in the join link"),
});

export const joinResultSchema = z.object({
  guestId: z.string().describe("The guest the link belongs to"),
  eventSlug: z.string().describe("The event the link opens"),
  joined: z
    .boolean()
    .describe(
      "False when the guest set a password after the link was made: sign in as them, then send the token again. Nothing changed."
    ),
});
