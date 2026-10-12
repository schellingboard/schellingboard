import { createRoute, z } from "@hono/zod-openapi";
import { eventViewSchema } from "@schellingboard/contracts/event";
import {
  eventMeetingsUpdateBodySchema,
  meetingPointInputSchema,
  meetingPointSchema,
  meetingPointUpdateBodySchema,
} from "@schellingboard/contracts/meeting";
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
  type App,
} from "@/server/http/route-parts";
import { toEventView } from "@/server/modules/events/module";
import type { MeetingPoint } from "@schellingboard/domain/meeting";
import type { MeetingUseCases } from "../application/use-cases";

const pointParams = z.object({
  eventId: z.string().min(1),
  id: z.string().min(1),
});

const updateEventMeetings = createRoute({
  method: "put",
  path: "/admin/events/{id}/meetings",
  tags: ["admin"],
  description: "Switches 1-on-1s on or off for an event, with its request cap.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(eventMeetingsUpdateBodySchema),
  },
  responses: {
    200: json(eventViewSchema, "The updated event"),
    ...versionConflictResponse(eventViewSchema),
    ...problemDefault,
  },
});

const createPoint = createRoute({
  method: "post",
  path: "/admin/events/{id}/meeting-points",
  tags: ["admin"],
  description: "Adds a suggested place to meet, after the event's others.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(meetingPointInputSchema),
  },
  responses: {
    201: json(meetingPointSchema, "The new meeting point"),
    ...problemDefault,
  },
});

const updatePoint = createRoute({
  method: "put",
  path: "/admin/events/{eventId}/meeting-points/{id}",
  tags: ["admin"],
  request: {
    headers: idempotencyHeaders,
    params: pointParams,
    body: body(meetingPointUpdateBodySchema),
  },
  responses: {
    200: json(meetingPointSchema, "The renamed meeting point"),
    ...versionConflictResponse(meetingPointSchema),
    ...problemDefault,
  },
});

const deletePoint = createRoute({
  method: "delete",
  path: "/admin/events/{eventId}/meeting-points/{id}",
  tags: ["admin"],
  request: { headers: idempotencyHeaders, params: pointParams },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

export function addAdminMeetingRoutes(
  app: App,
  meetings: () => MeetingUseCases
) {
  app.openapi(updateEventMeetings, async (c) => {
    const result = await meetings().updateEventMeetings(
      c.var.actor,
      {
        ...c.req.valid("json"),
        eventId: c.req.valid("param").id,
      },
      c.var.now
    );
    if (!result.ok) return problem(result.error, toEventView);
    return c.json(toEventView(result.value), 200);
  });

  app.openapi(createPoint, async (c) => {
    const result = await meetings().createMeetingPoint(
      c.var.actor,
      { ...c.req.valid("json"), eventId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 201);
  });

  app.openapi(updatePoint, async (c) => {
    const result = await meetings().updateMeetingPoint(
      c.var.actor,
      { ...c.req.valid("json"), ...c.req.valid("param") },
      c.var.now
    );
    if (!result.ok) return problem(result.error, (p: MeetingPoint) => p);
    return c.json(result.value, 200);
  });

  app.openapi(deletePoint, async (c) => {
    const result = await meetings().deleteMeetingPoint(
      c.var.actor,
      c.req.valid("param"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
