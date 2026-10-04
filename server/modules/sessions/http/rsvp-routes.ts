import { createRoute, z } from "@hono/zod-openapi";
import { rsvpListSchema, rsvpViewSchema } from "@schellingboard/contracts/rsvp";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import { idParam, json, noContent, type App } from "@/server/http/route-parts";
import type { SessionUseCases } from "../application/use-cases";

const rsvpParams = z.object({
  id: z.string().min(1),
  guestId: z.string().min(1),
});

const listSessionRsvps = createRoute({
  method: "get",
  path: "/sessions/{id}/rsvps",
  tags: ["rsvps"],
  request: { params: idParam },
  responses: {
    200: json(rsvpListSchema, "Who RSVPed to the session"),
    ...problemDefault,
  },
});

const listGuestRsvps = createRoute({
  method: "get",
  path: "/guests/{id}/rsvps",
  tags: ["rsvps"],
  description: "A protected guest's RSVPs need that guest's verified cookie.",
  request: { params: idParam },
  responses: {
    200: json(rsvpListSchema, "The guest's RSVPs in every event"),
    ...problemDefault,
  },
});

const rsvp = createRoute({
  method: "put",
  path: "/sessions/{id}/rsvps/{guestId}",
  tags: ["rsvps"],
  description:
    "RSVPs the named guest during scheduling; a protected guest needs its verified cookie.",
  request: { headers: idempotencyHeaders, params: rsvpParams },
  responses: { 204: noContent("RSVPed"), ...problemDefault },
});

const withdrawRsvp = createRoute({
  method: "delete",
  path: "/sessions/{id}/rsvps/{guestId}",
  tags: ["rsvps"],
  description: "Withdraws the named guest's RSVP during scheduling.",
  request: { headers: idempotencyHeaders, params: rsvpParams },
  responses: { 204: noContent("Withdrawn"), ...problemDefault },
});

const adminAddRsvp = createRoute({
  method: "put",
  path: "/admin/sessions/{id}/rsvps/{guestId}",
  tags: ["admin"],
  description:
    "RSVPs the guest in any phase, keeping a hard capacity limit, and adds them to the event.",
  request: { headers: idempotencyHeaders, params: rsvpParams },
  responses: {
    200: json(rsvpViewSchema, "The guest had already RSVPed"),
    201: json(rsvpViewSchema, "RSVPed"),
    ...problemDefault,
  },
});

const adminRemoveRsvp = createRoute({
  method: "delete",
  path: "/admin/sessions/{id}/rsvps/{guestId}",
  tags: ["admin"],
  request: { headers: idempotencyHeaders, params: rsvpParams },
  responses: { 204: noContent("Removed"), ...problemDefault },
});

export function addRsvpRoutes(app: App, sessions: () => SessionUseCases) {
  app.openapi(listSessionRsvps, async (c) => {
    const result = await sessions().listSessionRsvps(c.var.actor, {
      sessionId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json({ rsvps: result.value }, 200);
  });

  app.openapi(listGuestRsvps, async (c) => {
    const result = await sessions().listGuestRsvps(c.var.actor, {
      guestId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json({ rsvps: result.value }, 200);
  });

  app.openapi(rsvp, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const result = await sessions().rsvp(
      c.var.actor,
      { sessionId: id, guestId },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(withdrawRsvp, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const result = await sessions().withdrawRsvp(
      c.var.actor,
      { sessionId: id, guestId },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(adminAddRsvp, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const result = await sessions().adminAddRsvp(c.var.actor, {
      sessionId: id,
      guestId,
    });
    if (!result.ok) return problem(result.error);
    const { rsvp, created } = result.value;
    return c.json(rsvp, created ? 201 : 200);
  });

  app.openapi(adminRemoveRsvp, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const result = await sessions().adminRemoveRsvp(c.var.actor, {
      sessionId: id,
      guestId,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
