import { z } from "zod";

const release = z.object({
  version: z.string(),
  date: z
    .string()
    .nullable()
    .describe("`YYYY-MM-DD`; null when the release is not known to have one"),
});

export const updateStatusSchema = z.object({
  current: release,
  latest: release
    .nullable()
    .describe(
      "Null until the latest release has been looked up, or if it cannot be"
    ),
  updateAvailable: z.boolean(),
});

export type UpdateStatus = z.infer<typeof updateStatusSchema>;
