import { z } from "zod";

export const healthSchema = z.object({ status: z.literal("ok") });
