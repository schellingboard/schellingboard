import { createRoute, z } from "@hono/zod-openapi";
import { snapshotSchema } from "@schellingboard/contracts/snapshot";
import { problem, problemDefault } from "@/server/http/problem";
import { json, type App } from "@/server/http/route-parts";
import type { UnitOfWork } from "@/server/kernel/unit-of-work";
import { snapshotFor } from "./snapshot";

const getSnapshot = createRoute({
  method: "get",
  path: "/events/{slug}/snapshot",
  tags: ["events"],
  description:
    "The event's schedule, normalized, and `seq`, the last change it includes. `me` holds the RSVPs, meetings and free slots of the guest the `guest` cookie names; it is null without that cookie, or for a protected guest whose cookie is not verified.",
  request: { params: z.object({ slug: z.string().min(1) }) },
  responses: {
    200: json(snapshotSchema, "The snapshot"),
    ...problemDefault,
  },
});

export function addFeedRoutes(app: App, deps: { uow: UnitOfWork }): void {
  app.openapi(getSnapshot, async (c) => {
    const result = await snapshotFor(
      deps.uow,
      c.var.actor,
      c.req.valid("param").slug
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });
}
