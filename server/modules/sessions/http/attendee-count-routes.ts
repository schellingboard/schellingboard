import { createRoute } from "@hono/zod-openapi";
import {
  attendeeCountBodySchema,
  attendeeCountViewSchema,
} from "@schellingboard/contracts/attendee-count";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import { body, idParam, json, type App } from "@/server/http/route-parts";
import type { SessionUseCases } from "../application/use-cases";

const getAttendeeCount = createRoute({
  method: "get",
  path: "/sessions/{id}/attendee-count",
  tags: ["sessions"],
  description:
    "How many came, for a host once the session has finished. Anyone else, and an unknown session, get the same 403 attendeeCount.notHost.",
  request: { params: idParam },
  responses: {
    200: json(attendeeCountViewSchema, "The recorded count, or null"),
    ...problemDefault,
  },
});

const recordAttendeeCount = createRoute({
  method: "put",
  path: "/sessions/{id}/attendee-count",
  tags: ["sessions"],
  description:
    "Records how many came, as a host once the session has finished. The range is checked only after who is asking (400 attendeeCount.invalid).",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(attendeeCountBodySchema),
  },
  responses: {
    200: json(attendeeCountViewSchema, "The stored count"),
    ...problemDefault,
  },
});

export function addAttendeeCountRoutes(
  app: App,
  sessions: () => SessionUseCases
) {
  app.openapi(getAttendeeCount, async (c) => {
    const result = await sessions().getAttendeeCount(
      c.var.actor,
      { sessionId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json({ count: result.value }, 200);
  });

  app.openapi(recordAttendeeCount, async (c) => {
    const result = await sessions().recordAttendeeCount(
      c.var.actor,
      { sessionId: c.req.valid("param").id, count: c.req.valid("json").count },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json({ count: result.value }, 200);
  });
}
