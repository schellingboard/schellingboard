import { z } from "zod";

export const siteSettingsSchema = z.object({
  title: z.string(),
  description: z.string(),
  mapImageUrl: z.string().describe("Empty when there is no map"),
});

export const publicSiteSchema = siteSettingsSchema.extend({
  emailEnabled: z.boolean().describe("False when the server cannot send email"),
});

const proxySignInFields = {
  enabled: z.boolean(),
  headerName: z.string().describe("The request header that carries the email"),
  addresses: z
    .array(z.string())
    .describe("IPs or CIDR ranges of the proxy; empty means no address check"),
  logoutUrl: z.string().describe("Where Sign out leads; empty hides it"),
  siteAdmins: z
    .boolean()
    .describe("Whether site admins sign in through the proxy"),
  createPeople: z
    .boolean()
    .describe("Whether an email no person has makes a new person"),
  nameHeader: z
    .string()
    .describe("The header with a new person's name; empty uses the email"),
};

export const proxySignInInputSchema = z.object(proxySignInFields);

export const proxySignInSchema = proxySignInInputSchema.extend({
  secretSet: z.boolean().describe("Whether a secret is required of the proxy"),
  ownRequest: z
    .object({
      headerSeen: z.boolean(),
      trusted: z.boolean(),
    })
    .nullable()
    .describe("What this request carried; null while the sign-in is off"),
  disabledByEnvironment: z
    .boolean()
    .describe(
      "Whether SB_DISABLE_PROXY_SIGN_IN makes the server ignore these settings"
    ),
});

export const proxySecretSchema = z.object({
  secret: z.string().describe("Shown once; only its hash is kept"),
});
