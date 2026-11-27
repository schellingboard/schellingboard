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

export const chosenIdentitySchema = identitySchema.extend({
  locale: z
    .string()
    .nullable()
    .describe("The guest's chosen language; null follows the browser"),
});

export const currentIdentitySchema = chosenIdentitySchema.extend({
  fixedBy: z
    .object({
      logoutUrl: z.string().describe("Where Sign out leads; empty hides it"),
      siteAdmin: z.boolean().describe("Whether the person administers"),
    })
    .optional()
    .describe(
      "Present when a sign-in proxy decides who the browser acts as: no name picker, no switching"
    ),
  adminNeedsSignIn: z
    .boolean()
    .optional()
    .describe(
      "True when the person is a site admin but this session gives no admin rights: only a password or an emailed code does"
    ),
  nameToConfirm: z
    .string()
    .optional()
    .describe(
      "The name a proxy sign-in gave the person, present until they confirm it"
    ),
  proxyUnknownEmail: z
    .boolean()
    .optional()
    .describe(
      "True when a sign-in proxy sent an email that this site has no person for"
    ),
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

export const firstPasswordBodySchema = z.object({
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
    ? Boolean(body.name)
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
    username: usernameSchema.optional(),
    password: newPasswordSchema.optional(),
  })
  .refine(
    (body) =>
      (body.username === undefined && body.password === undefined) ||
      bootstrapTarget(body),
    {
      message: "Send either guestId, or name (and optionally email)",
    }
  );

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
  hasEmail: z.boolean().describe("False for a guest without an email address"),
  canSetPassword: z
    .boolean()
    .describe(
      "Whether this login may set the first password: a verified one, for a name with none that is no site admin"
    ),
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
      "False when the guest has a password or is a site admin: sign in as them, then send the token again. Nothing changed."
    ),
});
