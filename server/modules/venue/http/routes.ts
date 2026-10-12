import { createRoute, z } from "@hono/zod-openapi";
import {
  eventLocationsBodySchema,
  locationBodySchema,
  locationListSchema,
  locationMoveSchema,
  locationUpdateBodySchema,
  locationViewSchema,
} from "@schellingboard/contracts/location";
import { idempotencyHeaders } from "@/server/http/idempotency";
import {
  problem,
  problemDefault,
  versionConflictResponse,
} from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  textExpectedVersion,
  type App,
} from "@/server/http/route-parts";
import {
  MAX_IMAGE_BYTES,
  MIN_IMAGE_WIDTH,
} from "@/utils/location-image-constraints";
import type { LocationWithEvents } from "../application/locations";
import type { VenueUseCases } from "../application/use-cases";
import { toLocationView } from "./view";

const tags = ["admin"];

function toLocationWithEventsView(
  l: LocationWithEvents
): z.input<typeof locationViewSchema> {
  return { ...toLocationView(l), eventIds: l.eventIds };
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
    "Adds a location after the others; its image is set with PUT /admin/locations/{id}/image.",
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
    body: body(locationUpdateBodySchema),
  },
  responses: {
    200: json(locationViewSchema, "The updated location"),
    ...versionConflictResponse(locationViewSchema),
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
    200: json(
      locationListSchema,
      "Every location in the new order; unchanged when already at that end"
    ),
    ...versionConflictResponse(locationViewSchema),
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

const imageForm = z.object({
  image: z
    .instanceof(File)
    .openapi({ type: "string", format: "binary" })
    .describe(
      `JPEG, PNG or WebP, at most ${MAX_IMAGE_BYTES / 1024 / 1024} MiB, at least ${MIN_IMAGE_WIDTH} px wide, 4:3`
    ),
  expectedVersion: textExpectedVersion,
});

const replaceLocationImage = createRoute({
  method: "put",
  path: "/admin/locations/{id}/image",
  tags,
  description: "Replaces the location's image.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: {
      required: true,
      content: { "multipart/form-data": { schema: imageForm } },
    },
  },
  responses: {
    200: json(locationViewSchema, "The location with its new image"),
    ...versionConflictResponse(locationViewSchema),
    ...problemDefault,
  },
});

const removeLocationImage = createRoute({
  method: "delete",
  path: "/admin/locations/{id}/image",
  tags,
  description: "Removes the location's image.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    query: z.object({ expectedVersion: textExpectedVersion }),
  },
  responses: {
    200: json(locationViewSchema, "The location without an image"),
    ...versionConflictResponse(locationViewSchema),
    ...problemDefault,
  },
});

export function addAdminVenueRoutes(app: App, venue: () => VenueUseCases) {
  app.openapi(listLocations, async (c) => {
    const result = await venue().listLocations(
      c.var.actor,
      c.req.valid("query")
    );
    if (!result.ok) return problem(result.error);
    return c.json(
      { locations: result.value.map(toLocationWithEventsView) },
      200
    );
  });

  app.openapi(createLocation, async (c) => {
    const result = await venue().createLocation(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.json(toLocationWithEventsView(result.value), 201);
  });

  app.openapi(updateLocation, async (c) => {
    const result = await venue().updateLocation(c.var.actor, {
      ...c.req.valid("json"),
      id: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error, toLocationWithEventsView);
    return c.json(toLocationWithEventsView(result.value), 200);
  });

  app.openapi(replaceLocationImage, async (c) => {
    const { image, expectedVersion } = c.req.valid("form");
    const result = await venue().replaceLocationImage(c.var.actor, {
      id: c.req.valid("param").id,
      image: Buffer.from(await image.arrayBuffer()),
      expectedVersion,
    });
    if (!result.ok) return problem(result.error, toLocationWithEventsView);
    return c.json(toLocationWithEventsView(result.value), 200);
  });

  app.openapi(removeLocationImage, async (c) => {
    const result = await venue().removeLocationImage(c.var.actor, {
      id: c.req.valid("param").id,
      ...c.req.valid("query"),
    });
    if (!result.ok) return problem(result.error, toLocationWithEventsView);
    return c.json(toLocationWithEventsView(result.value), 200);
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
    if (!result.ok) return problem(result.error, toLocationWithEventsView);
    return c.json(
      { locations: result.value.map(toLocationWithEventsView) },
      200
    );
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
