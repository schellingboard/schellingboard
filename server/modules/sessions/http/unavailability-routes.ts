import { createRoute } from "@hono/zod-openapi";
import {
  unavailabilityBodySchema,
  unavailabilityListSchema,
} from "@schellingboard/contracts/location";
import type { LocationUnavailability } from "@schellingboard/domain/location";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { SessionUseCases } from "../application/use-cases";

const tags = ["admin"];

const toView = (p: LocationUnavailability) => ({
  ...p,
  start: p.start.toISOString(),
  end: p.end.toISOString(),
});

const list = createRoute({
  method: "get",
  path: "/admin/events/{id}/location-unavailability",
  tags,
  description: "When the event's rooms cannot be booked, ordered by start.",
  request: { params: idParam },
  responses: {
    200: json(unavailabilityListSchema, "The periods"),
    ...problemDefault,
  },
});

const add = createRoute({
  method: "post",
  path: "/admin/events/{id}/location-unavailability",
  tags,
  description:
    "Marks the rooms, all assigned to the event, unavailable for one period.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(unavailabilityBodySchema),
  },
  responses: { 204: noContent("Added"), ...problemDefault },
});

const remove = createRoute({
  method: "delete",
  path: "/admin/location-unavailability/{id}",
  tags,
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

export function addAdminUnavailabilityRoutes(
  app: App,
  sessions: () => SessionUseCases
) {
  app.openapi(list, async (c) => {
    const result = await sessions().listLocationUnavailability(c.var.actor, {
      eventId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json({ periods: result.value.map(toView) }, 200);
  });

  app.openapi(add, async (c) => {
    const { start, end, locationIds } = c.req.valid("json");
    const result = await sessions().addLocationUnavailability(c.var.actor, {
      eventId: c.req.valid("param").id,
      locationIds,
      start: new Date(start),
      end: new Date(end),
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(remove, async (c) => {
    const result = await sessions().deleteLocationUnavailability(
      c.var.actor,
      c.req.valid("param")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
