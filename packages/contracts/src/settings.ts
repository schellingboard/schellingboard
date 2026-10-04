import { z } from "zod";

export const siteSettingsSchema = z.object({
  title: z.string(),
  description: z.string(),
  mapImageUrl: z.string().describe("Empty when there is no map"),
});
