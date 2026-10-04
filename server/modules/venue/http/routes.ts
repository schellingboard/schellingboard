import { createRoute, z } from "@hono/zod-openapi";
import {
  eventLocationsBodySchema,
  locationBodySchema,
  locationListSchema,
  locationMoveSchema,
  locationViewSchema,
} from "@schellingboard/contracts/location";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { LocationWithEvents } from "../application/locations";
import type { VenueUseCases } from "../application/use-cases";

const tags = ["admin"];

function toLocationView(
  l: LocationWithEvents
): z.input<typeof locationViewSchema> {
  return {
    id: l.id,
    name: l.name,
    description: l.description,
    areaDescription: l.areaDescription ?? null,
    capacity: l.capacity,
    color: l.color,
    bookable: l.bookable,
    imageUrl: l.imageUrl,
    sortIndex: l.sortIndex,
    eventIds: l.eventIds,
  };
}

const listLocations = createRoute({
  method: "get",
  path: "/admin/locations",
  tags,
  description:
    "Every location in display order, hidden ones included; with `eventId`, those assigned to that event.",
  request: { query: z.object({ eventId: z.string().min(1).optional() }) },
  responses: {
    200: json(locationListSchema, "The locations"),
    ...problemDefault,
  },
});

const createLocation = createRoute({
  method: "post",
  path: "/admin/locations",
  tags,
  description:
    "Adds a location after the others. Images are set in the admin UI.",
  request: { headers: idempotencyHeaders, body: body(locationBodySchema) },
  responses: {
    201: json(locationViewSchema, "The new location"),
    ...problemDefault,
  },
});

const updateLocation = createRoute({
  method: "put",
  path: "/admin/locations/{id}",
  tags,
  description:
    "Replaces the location's fields and events; its image and place in the order stay.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(locationBodySchema),
  },
  responses: {
    200: json(locationViewSchema, "The updated location"),
    ...problemDefault,
  },
});

const deleteLocation = createRoute({
  method: "delete",
  path: "/admin/locations/{id}",
  tags,
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

const moveLocation = createRoute({
  method: "post",
  path: "/admin/locations/{id}/move",
  tags,
  description: "Swaps the location with its neighbour in the display order.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(locationMoveSchema),
  },
  responses: {
    204: noContent("Moved, or already at that end"),
    ...problemDefault,
  },
});

const assign = createRoute({
  method: "post",
  path: "/admin/events/{id}/locations/assign",
  tags,
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(eventLocationsBodySchema),
  },
  responses: { 204: noContent("Assigned"), ...problemDefault },
});

const remove = createRoute({
  method: "post",
  path: "/admin/events/{id}/locations/remove",
  tags,
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(eventLocationsBodySchema),
  },
  responses: { 204: noContent("Removed"), ...problemDefault },
});

export function addAdminVenueRoutes(app: App, venue: () => VenueUseCases) {
  app.openapi(listLocations, async (c) => {
    const result = await venue().listLocations(
      c.var.actor,
      c.req.valid("query")
    );
    if (!result.ok) return problem(result.error);
    return c.json(
      {
        locations: result.value.map(toLocationView),
      },
      200
    );
  });

  app.openapi(createLocation, async (c) => {
    const result = await venue().createLocation(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.json(toLocationView(result.value), 201);
  });

  app.openapi(updateLocation, async (c) => {
    const result = await venue().updateLocation(c.var.actor, {
      ...c.req.valid("json"),
      id: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(toLocationView(result.value), 200);
  });

  app.openapi(deleteLocation, async (c) => {
    const result = await venue().deleteLocation(
      c.var.actor,
      c.req.valid("param")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(moveLocation, async (c) => {
    const result = await venue().moveLocation(c.var.actor, {
      ...c.req.valid("json"),
      id: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(assign, async (c) => {
    const result = await venue().assignLocationsToEvent(c.var.actor, {
      ...c.req.valid("json"),
      eventId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(remove, async (c) => {
    const result = await venue().removeLocationsFromEvent(c.var.actor, {
      ...c.req.valid("json"),
      eventId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
