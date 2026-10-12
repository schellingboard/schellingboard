import { z } from "zod";

export const healthSchema = z.object({
  status: z.literal("ok"),
  version: z.string().describe("The release or commit this server runs"),
  buildId: z
    .string()
    .describe("Differs between builds; a client that sees it change is stale"),
});
