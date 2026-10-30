import { createRoute, z } from "@hono/zod-openapi";
import { notFound } from "@/server/kernel/result";
import {
  isDevToolsEnabled,
  nowWithOffset,
  parseTimeOffset,
  readTimeOffsetCookie,
} from "@/utils/dev-clock";
import { idempotencyHeaders } from "./idempotency";
import { problem, problemDefault } from "./problem";
import { json, type App } from "./route-parts";

const route = createRoute({
  method: "post",
  path: "/dev/reminders",
  tags: ["dev"],
  description:
    "Runs one reminder tick against the dev clock. `route.notFound` (404) unless the dev tools are on.",
  request: { headers: idempotencyHeaders },
  responses: {
    200: json(z.object({ sent: z.number().int() }), "The reminders sent"),
    ...problemDefault,
  },
});

export function addDevRoutes(
  app: App,
  dispatch: (now: Date) => Promise<{ sent: number }>
) {
  app.openapi(route, async (c) => {
    if (!isDevToolsEnabled())
      return problem(notFound("route.notFound", "Not found").error);
    const now = nowWithOffset(parseTimeOffset(readTimeOffsetCookie(c.req.raw)));
    return c.json({ sent: (await dispatch(now)).sent }, 200);
  });
}
