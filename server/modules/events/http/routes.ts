import { createRoute } from "@hono/zod-openapi";
import {
  dayBodySchema,
  dayViewSchema,
  eventDetailSchema,
  eventListSchema,
  eventPhasesBodySchema,
  eventSettingsBodySchema,
  eventViewSchema,
} from "@schellingboard/contracts/event";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { EventUseCases } from "../application/use-cases";
import { toDayView, toEventView } from "./view";

const tags = ["admin"];
const dates = <T extends Record<string, string | null>>(fields: T) =>
  Object.fromEntries(
    Object.entries(fields).map(([k, v]) => [k, v ? new Date(v) : undefined])
  ) as { [K in keyof T]: Date | undefined };

const listEvents = createRoute({
  method: "get",
  path: "/admin/events",
  tags,
  responses: {
    200: json(eventListSchema, "Every event, hidden or past ones included"),
    ...problemDefault,
  },
});

const getEvent = createRoute({
  method: "get",
  path: "/admin/events/{id}",
  tags,
  description: "The event's settings, phase dates and days.",
  request: { params: idParam },
  responses: {
    200: json(eventDetailSchema, "The event and its days"),
    ...problemDefault,
  },
});

const createEvent = createRoute({
  method: "post",
  path: "/admin/events",
  tags,
  description: "Creates an event; its URL slug is derived from the name.",
  request: { headers: idempotencyHeaders, body: body(eventSettingsBodySchema) },
  responses: {
    201: json(eventViewSchema, "The new event"),
    ...problemDefault,
  },
});

const updateEvent = createRoute({
  method: "put",
  path: "/admin/events/{id}",
  tags,
  description:
    "Replaces the event's settings; phase dates, 1-on-1 settings and the slug stay. A new slot increment clears declared 1-on-1 availability.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(eventSettingsBodySchema),
  },
  responses: {
    200: json(eventViewSchema, "The updated event"),
    ...problemDefault,
  },
});

const updatePhases = createRoute({
  method: "put",
  path: "/admin/events/{id}/phases",
  tags,
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(eventPhasesBodySchema),
  },
  responses: {
    200: json(eventViewSchema, "The updated event"),
    ...problemDefault,
  },
});

const deleteEvent = createRoute({
  method: "delete",
  path: "/admin/events/{id}",
  tags,
  description:
    "Deletes the event with its days, proposals, sessions and everything attached.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

const createDay = createRoute({
  method: "post",
  path: "/admin/events/{id}/days",
  tags,
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(dayBodySchema),
  },
  responses: { 201: json(dayViewSchema, "The new day"), ...problemDefault },
});

const updateDay = createRoute({
  method: "put",
  path: "/admin/days/{id}",
  tags,
  description:
    "Refused while a session scheduled in the day would fall outside it.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(dayBodySchema),
  },
  responses: { 200: json(dayViewSchema, "The updated day"), ...problemDefault },
});

const deleteDay = createRoute({
  method: "delete",
  path: "/admin/days/{id}",
  tags,
  description: "Deletes the day and every session overlapping it.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

export function addAdminEventRoutes(app: App, events: () => EventUseCases) {
  app.openapi(listEvents, async (c) => {
    const result = await events().listEvents(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.json({ events: result.value.map(toEventView) }, 200);
  });

  app.openapi(getEvent, async (c) => {
    const result = await events().getEvent(c.var.actor, c.req.valid("param"));
    if (!result.ok) return problem(result.error);
    const { event, days } = result.value;
    return c.json(
      { event: toEventView(event), days: days.map(toDayView) },
      200
    );
  });

  app.openapi(createEvent, async (c) => {
    const result = await events().createEvent(c.var.actor, c.req.valid("json"));
    if (!result.ok) return problem(result.error);
    return c.json(toEventView(result.value), 201);
  });

  app.openapi(updateEvent, async (c) => {
    const result = await events().updateEvent(c.var.actor, {
      ...c.req.valid("json"),
      id: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(toEventView(result.value), 200);
  });

  app.openapi(updatePhases, async (c) => {
    const result = await events().updateEventPhases(c.var.actor, {
      ...dates(c.req.valid("json")),
      id: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(toEventView(result.value), 200);
  });

  app.openapi(deleteEvent, async (c) => {
    const result = await events().deleteEvent(
      c.var.actor,
      c.req.valid("param")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(createDay, async (c) => {
    const result = await events().createDay(c.var.actor, {
      ...dates(c.req.valid("json")),
      eventId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(toDayView(result.value), 201);
  });

  app.openapi(updateDay, async (c) => {
    const result = await events().updateDay(c.var.actor, {
      ...dates(c.req.valid("json")),
      id: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(toDayView(result.value), 200);
  });

  app.openapi(deleteDay, async (c) => {
    const result = await events().deleteDay(c.var.actor, c.req.valid("param"));
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
