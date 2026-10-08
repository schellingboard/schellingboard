import { createRoute, z } from "@hono/zod-openapi";
import {
  adminSessionCreateSchema,
  adminSessionUpdateSchema,
  sessionCreateSchema,
  sessionListSchema,
  sessionUpdateSchema,
  sessionViewSchema,
} from "@schellingboard/contracts/session";
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
import type { SessionUseCases } from "../application/use-cases";
import { toSessionView } from "./view";

const getSession = createRoute({
  method: "get",
  path: "/sessions/{id}",
  tags: ["sessions"],
  request: { params: idParam },
  responses: {
    200: json(sessionViewSchema, "The session"),
    ...problemDefault,
  },
});

const listSessions = createRoute({
  method: "get",
  path: "/sessions",
  tags: ["sessions"],
  request: { query: z.object({ eventId: z.string().min(1) }) },
  responses: {
    200: json(sessionListSchema, "The event's sessions, scheduled or not"),
    ...problemDefault,
  },
});

const createSession = createRoute({
  method: "post",
  path: "/sessions",
  tags: ["sessions"],
  description: "Books a session as the acting guest, during scheduling.",
  request: { headers: idempotencyHeaders, body: body(sessionCreateSchema) },
  responses: {
    201: json(sessionViewSchema, "The booked session"),
    ...problemDefault,
  },
});

const updateSession = createRoute({
  method: "put",
  path: "/sessions/{id}",
  tags: ["sessions"],
  description: "Replaces a session the acting guest hosts.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(sessionUpdateSchema),
  },
  responses: {
    200: json(sessionViewSchema, "The updated session"),
    ...versionConflictResponse(sessionViewSchema),
    ...problemDefault,
  },
});

const deleteSession = createRoute({
  method: "delete",
  path: "/sessions/{id}",
  tags: ["sessions"],
  description: "Deletes a session the acting guest hosts.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

const adminCreateSession = createRoute({
  method: "post",
  path: "/admin/sessions",
  tags: ["admin"],
  request: {
    headers: idempotencyHeaders,
    body: body(adminSessionCreateSchema),
  },
  responses: {
    201: json(sessionViewSchema, "The created session"),
    ...problemDefault,
  },
});

const adminUpdateSession = createRoute({
  method: "put",
  path: "/admin/sessions/{id}",
  tags: ["admin"],
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(adminSessionUpdateSchema),
  },
  responses: {
    200: json(sessionViewSchema, "The updated session"),
    ...versionConflictResponse(sessionViewSchema),
    ...problemDefault,
  },
});

const adminDeleteSession = createRoute({
  method: "delete",
  path: "/admin/sessions/{id}",
  tags: ["admin"],
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

export function addSessionRoutes(app: App, sessions: () => SessionUseCases) {
  app.openapi(getSession, async (c) => {
    const result = await sessions().getSession(c.var.actor, {
      sessionId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(toSessionView(result.value), 200);
  });

  app.openapi(listSessions, async (c) => {
    const result = await sessions().listSessions(
      c.var.actor,
      c.req.valid("query")
    );
    if (!result.ok) return problem(result.error);
    return c.json({ sessions: result.value.map(toSessionView) }, 200);
  });

  app.openapi(createSession, async (c) => {
    const { startTime, ...input } = c.req.valid("json");
    const result = await sessions().createSession(
      c.var.actor,
      { ...input, startTime: new Date(startTime) },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toSessionView(result.value), 201);
  });

  app.openapi(updateSession, async (c) => {
    const { startTime, ...input } = c.req.valid("json");
    const result = await sessions().updateSession(
      c.var.actor,
      {
        ...input,
        sessionId: c.req.valid("param").id,
        startTime: new Date(startTime),
      },
      c.var.now
    );
    if (!result.ok) return problem(result.error, toSessionView);
    return c.json(toSessionView(result.value), 200);
  });

  app.openapi(deleteSession, async (c) => {
    const result = await sessions().deleteSession(
      c.var.actor,
      { sessionId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(adminCreateSession, async (c) => {
    const result = await sessions().adminCreateSession(
      c.var.actor,
      c.req.valid("json"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toSessionView(result.value), 201);
  });

  app.openapi(adminUpdateSession, async (c) => {
    const result = await sessions().adminUpdateSession(
      c.var.actor,
      { ...c.req.valid("json"), id: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error, toSessionView);
    return c.json(toSessionView(result.value), 200);
  });

  app.openapi(adminDeleteSession, async (c) => {
    const result = await sessions().adminDeleteSession(
      c.var.actor,
      { id: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
