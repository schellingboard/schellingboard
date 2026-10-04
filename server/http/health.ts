import { createRoute } from "@hono/zod-openapi";
import { healthSchema } from "@schellingboard/contracts/health";
import type { createApp } from "./create-app";

const route = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: {
      description: "The server is up",
      content: { "application/json": { schema: healthSchema } },
    },
  },
});

export function addHealthRoute(app: ReturnType<typeof createApp>) {
  app.openapi(route, (c) => c.json({ status: "ok" as const }, 200));
}
