import { createRoute } from "@hono/zod-openapi";
import {
  adminGuestBodySchema,
  adminGuestListSchema,
  adminGuestViewSchema,
  eventGuestsBodySchema,
  guestImportBodySchema,
  guestImportResultSchema,
} from "@schellingboard/contracts/guest";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import {
  body,
  idParam,
  json,
  noContent,
  type App,
} from "@/server/http/route-parts";
import type { PeopleUseCases } from "../application/use-cases";

const tags = ["admin"];

const listGuests = createRoute({
  method: "get",
  path: "/admin/guests",
  tags,
  description: "Every guest with their email and the events they belong to.",
  responses: {
    200: json(adminGuestListSchema, "The guests"),
    ...problemDefault,
  },
});

const createGuest = createRoute({
  method: "post",
  path: "/admin/guests",
  tags,
  description:
    "Adds a guest; an email another guest has (in any case) is 409 guest.emailTaken.",
  request: { headers: idempotencyHeaders, body: body(adminGuestBodySchema) },
  responses: {
    201: json(adminGuestViewSchema, "The new guest"),
    ...problemDefault,
  },
});

const updateGuest = createRoute({
  method: "put",
  path: "/admin/guests/{id}",
  tags,
  description: "Replaces the guest's name and email.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(adminGuestBodySchema),
  },
  responses: {
    200: json(adminGuestViewSchema, "The updated guest"),
    ...problemDefault,
  },
});

const deleteGuest = createRoute({
  method: "delete",
  path: "/admin/guests/{id}",
  tags,
  description:
    "Deletes the guest with their votes, RSVPs, hosting and meetings; their comments stay without an author.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Deleted"), ...problemDefault },
});

const sendTestEmail = createRoute({
  method: "post",
  path: "/admin/guests/{id}/test-email",
  tags,
  description:
    "Mails the guest a test message; a mail server failure is 503 mail.failed.",
  request: { headers: idempotencyHeaders, params: idParam },
  responses: { 204: noContent("Sent"), ...problemDefault },
});

const importGuests = createRoute({
  method: "post",
  path: "/admin/guests/import",
  tags,
  description:
    "Creates the CSV's guests not yet known by email and adds every row's guest to the events. Any bad row refuses the whole file with 400 guestImport.invalid, one `errors` entry per problem.",
  request: { headers: idempotencyHeaders, body: body(guestImportBodySchema) },
  responses: {
    200: json(guestImportResultSchema, "Imported"),
    ...problemDefault,
  },
});

const assign = createRoute({
  method: "post",
  path: "/admin/events/{id}/guests/assign",
  tags,
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(eventGuestsBodySchema),
  },
  responses: { 204: noContent("Assigned"), ...problemDefault },
});

const remove = createRoute({
  method: "post",
  path: "/admin/events/{id}/guests/remove",
  tags,
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(eventGuestsBodySchema),
  },
  responses: { 204: noContent("Removed"), ...problemDefault },
});

export function addAdminGuestRoutes(app: App, people: () => PeopleUseCases) {
  app.openapi(listGuests, async (c) => {
    const result = await people().listGuests(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.json({ guests: result.value }, 200);
  });

  app.openapi(createGuest, async (c) => {
    const result = await people().createGuest(c.var.actor, c.req.valid("json"));
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 201);
  });

  app.openapi(updateGuest, async (c) => {
    const result = await people().updateGuest(c.var.actor, {
      ...c.req.valid("json"),
      id: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(deleteGuest, async (c) => {
    const result = await people().deleteGuest(
      c.var.actor,
      c.req.valid("param")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(sendTestEmail, async (c) => {
    const result = await people().sendTestEmail(
      c.var.actor,
      c.req.valid("param")
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(importGuests, async (c) => {
    const result = await people().importGuests(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(assign, async (c) => {
    const result = await people().assignGuestsToEvent(c.var.actor, {
      ...c.req.valid("json"),
      eventId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(remove, async (c) => {
    const result = await people().removeGuestsFromEvent(c.var.actor, {
      ...c.req.valid("json"),
      eventId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
