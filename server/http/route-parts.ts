import { z } from "@hono/zod-openapi";
import type { createApp } from "./create-app";

export type App = ReturnType<typeof createApp>;

export const json = <T extends z.ZodType>(schema: T, description: string) => ({
  description,
  content: { "application/json": { schema } },
});
export const body = <T extends z.ZodType>(schema: T) => ({
  required: true,
  content: { "application/json": { schema } },
});
export const idParam = z.object({ id: z.string().min(1) });
export const noContent = (description: string) => ({ description });
