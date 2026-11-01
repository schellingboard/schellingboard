import { createRoute } from "@hono/zod-openapi";
import {
  adminGuestBodySchema,
  adminGuestListSchema,
  adminGuestUpdateBodySchema,
  adminGuestViewSchema,
  eventGuestsBodySchema,
  guestImportBodySchema,
  guestImportResultSchema,
  joinLinkViewSchema,
  mailJoinLinksBodySchema,
  mailJoinLinksResultSchema,
  siteAdminBodySchema,
} from "@schellingboard/contracts/guest";
import { z } from "@hono/zod-openapi";
import { pageQuerySchema } from "@schellingboard/contracts/cursor-page";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { pageOf } from "@/server/http/pagination";
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
import type { AdminGuest } from "../application/admin-guests";
import type { PeopleUseCases } from "../application/use-cases";

const tags = ["admin"];

const listGuests = createRoute({
  method: "get",
  path: "/admin/guests",
  tags,
  description:
    "Every guest with their email and the events they belong to, in id order.",
  request: { query: pageQuerySchema },
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
    body: body(adminGuestUpdateBodySchema),
  },
  responses: {
    200: json(adminGuestViewSchema, "The updated guest"),
    ...versionConflictResponse(adminGuestViewSchema),
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

const setSiteAdmin = createRoute({
  method: "put",
  path: "/admin/guests/{id}/site-admin",
  tags,
  description:
    "Grants or revokes the site-admin role, which also protects the guest's name. Revoking the last site admin is 409 siteAdmin.last.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(siteAdminBodySchema),
  },
  responses: {
    200: json(adminGuestViewSchema, "The updated guest"),
    ...problemDefault,
  },
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

const createJoinLink = createRoute({
  method: "post",
  path: "/admin/events/{id}/guests/{guestId}/join-link",
  tags,
  description:
    "Makes a personal join link for the guest, ending their earlier one for this event, and emails the guest that a new link exists (never the link). The token is shown only in this answer.",
  request: { params: idParam.extend({ guestId: z.string() }) },
  responses: {
    201: json(joinLinkViewSchema, "The new link"),
    ...problemDefault,
  },
});

const mailJoinLinks = createRoute({
  method: "post",
  path: "/admin/events/{id}/join-links/mail",
  tags,
  description:
    "Makes a new join link for each of the `guestIds` (every guest of the event when omitted) and mails it to them, ending their earlier ones. Guests without an email are counted, not mailed. A link is made before its mail is sent, so a failed send leaves the guest with a link they never got: mail again. Unknown ids are 400 `guest.unknown`. `auth.mailUnavailable` (503) when the server cannot send email.",
  request: {
    headers: idempotencyHeaders,
    params: idParam,
    body: body(mailJoinLinksBodySchema),
  },
  responses: {
    200: json(mailJoinLinksResultSchema, "How many were mailed"),
    ...problemDefault,
  },
});

export function addAdminGuestRoutes(app: App, people: () => PeopleUseCases) {
  app.openapi(listGuests, async (c) => {
    const result = await people().listGuests(c.var.actor);
    if (!result.ok) return problem(result.error);
    const page = pageOf(result.value, c.req.valid("query"), "guests", (g) => [
      g.id,
    ]);
    if (!page.ok) return problem(page.error);
    return c.json(page.value, 200);
  });

  app.openapi(createGuest, async (c) => {
    const result = await people().createGuest(c.var.actor, c.req.valid("json"));
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 201);
  });

  app.openapi(updateGuest, async (c) => {
    const result = await people().updateGuest(
      c.var.actor,
      { ...c.req.valid("json"), id: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error, (g: AdminGuest) => g);
    return c.json(result.value, 200);
  });

  app.openapi(setSiteAdmin, async (c) => {
    const result = await people().setSiteAdmin(
      c.var.actor,
      { id: c.req.valid("param").id, ...c.req.valid("json") },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(deleteGuest, async (c) => {
    const result = await people().deleteGuest(
      c.var.actor,
      c.req.valid("param"),
      c.var.now
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
      c.req.valid("json"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(assign, async (c) => {
    const result = await people().assignGuestsToEvent(
      c.var.actor,
      { ...c.req.valid("json"), eventId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });

  app.openapi(createJoinLink, async (c) => {
    const { id, guestId } = c.req.valid("param");
    const result = await people().createJoinLink(c.var.actor, {
      eventId: id,
      guestId,
    });
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 201);
  });

  app.openapi(mailJoinLinks, async (c) => {
    const result = await people().mailJoinLinks(c.var.actor, {
      ...c.req.valid("json"),
      eventId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(remove, async (c) => {
    const result = await people().removeGuestsFromEvent(
      c.var.actor,
      { ...c.req.valid("json"), eventId: c.req.valid("param").id },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
