import { createRoute, z } from "@hono/zod-openapi";
import { setSessionMarkSchema } from "@schellingboard/contracts/session-mark";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import { noContent, type App } from "@/server/http/route-parts";
import type { SessionUseCases } from "../application/use-cases";

const markParams = z.object({
  id: z.string().min(1),
  guestId: z.string().min(1),
});

const setMark = createRoute({
  method: "put",
  path: "/sessions/{id}/marks/{guestId}",
  tags: ["session marks"],
  description:
    "Bookmarks the session for the named guest, or hides it. Replaces an earlier mark. Private to the guest, in any phase.",
  request: {
    headers: idempotencyHeaders,
    params: markParams,
    body: {
      required: true,
      content: { "application/json": { schema: setSessionMarkSchema } },
    },
  },
  responses: { 204: noContent("Marked"), ...problemDefault },
});

const clearMark = createRoute({
  method: "delete",
  path: "/sessions/{id}/marks/{guestId}",
  tags: ["session marks"],
  description: "Removes the named guest's mark from the session, if any.",
  request: { headers: idempotencyHeaders, params: markParams },
  responses: { 204: noContent("Cleared"), ...problemDefault },
});

export function addSessionMarkRoutes(
  app: App,
  sessions: () => SessionUseCases
) {
  app.openapi(setMark, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const { kind } = c.req.valid("json");
    const result = await sessions().setSessionMark(
      c.var.actor,
      { sessionId: id, guestId, kind },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(clearMark, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const result = await sessions().clearSessionMark(
      c.var.actor,
      { sessionId: id, guestId },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
