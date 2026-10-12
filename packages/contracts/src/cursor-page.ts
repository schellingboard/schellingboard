import { z } from "zod";

export const MAX_PAGE_LIMIT = 1000;

export const pageQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_LIMIT)
    .default(100)
    .describe("How many items to answer at most"),
  cursor: z
    .string()
    .optional()
    .describe("The `nextCursor` of the previous page; left out for the first"),
});

export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z
      .string()
      .nullable()
      .describe("Pass as `cursor` for the next page; null on the last"),
  });
