import { createRoute } from "@hono/zod-openapi";
import { healthSchema } from "@schellingboard/contracts/health";
import { getAppVersion } from "@/utils/git";
import { getBuildId } from "@/utils/build-id";
import type { createApp } from "./create-app";

const route = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: {
      description: "The server is up, and which build it runs",
      content: { "application/json": { schema: healthSchema } },
    },
  },
});

export function addHealthRoute(app: ReturnType<typeof createApp>) {
  app.openapi(route, (c) =>
    c.json(
      {
        status: "ok" as const,
        version: getAppVersion(),
        buildId: getBuildId(),
      },
      200
    )
  );
}
