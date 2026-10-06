import { z } from "zod";

// RFC 9457, as ADR 0012 section 4 has the API send it. Clients branch on
// `code`; `detail` is for people reading logs.
export const problemSchema = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    code: z.string(),
    detail: z.string().optional(),
    errors: z
      .array(z.object({ path: z.string(), message: z.string() }))
      .optional(),
  })
  .meta({ id: "Problem" });
