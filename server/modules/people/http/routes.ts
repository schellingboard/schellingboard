import { createRoute, z } from "@hono/zod-openapi";
import { pageQuerySchema } from "@schellingboard/contracts/cursor-page";
import {
  profileBodySchema,
  publicProfileListSchema,
  publicProfileSchema,
} from "@schellingboard/contracts/guest";
import { expectedVersion as sharedExpectedVersion } from "@schellingboard/contracts/session";
import { MIN_AVATAR_WIDTH } from "@/utils/avatar-image-constraints";
import { MAX_IMAGE_BYTES } from "@/utils/images";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { pageOf } from "@/server/http/pagination";
import {
  problem,
  problemDefault,
  versionConflictResponse,
} from "@/server/http/problem";
import { body, idParam, json, type App } from "@/server/http/route-parts";
import type { PeopleUseCases } from "../application/use-cases";
import { toProfileView } from "./view";

// Form fields and query parameters arrive as text.
const expectedVersion = z
  .string()
  .regex(/^\d+$/)
  .transform(Number)
  .describe(sharedExpectedVersion.description ?? "");

const avatarForm = z.object({
  avatar: z
    .instanceof(File)
    .openapi({ type: "string", format: "binary" })
    .describe(
      `JPEG, PNG or WebP, at most ${MAX_IMAGE_BYTES / 1024 / 1024} MiB, at least ${MIN_AVATAR_WIDTH} px square`
    ),
  expectedVersion,
});

const listEventProfiles = createRoute({
  method: "get",
  path: "/guests",
  tags: ["people"],
  description:
    "The public profiles of an event's guests, in id order; for the event's guests and admins.",
  request: {
    query: pageQuerySchema.extend({
      eventId: z.string().min(1).describe("The event whose guests to list"),
    }),
  },
  responses: {
    200: json(publicProfileListSchema, "The event's guests"),
    ...problemDefault,
  },
});

const getProfile = createRoute({
  method: "get",
  path: "/guests/{id}",
  tags: ["people"],
  description: "A guest's public profile.",
  request: { params: idParam },
  responses: {
    200: json(publicProfileSchema, "The public profile"),
    ...problemDefault,
  },
});

const updateMyProfile = createRoute({
  method: "put",
  path: "/me/profile",
  tags: ["people"],
  description:
    "Replaces the acting guest's public profile; the photo is kept (see /me/avatar).",
  request: { headers: idempotencyHeaders, body: body(profileBodySchema) },
  responses: {
    200: json(publicProfileSchema, "The saved profile"),
    ...versionConflictResponse(publicProfileSchema),
    ...problemDefault,
  },
});

const replaceMyAvatar = createRoute({
  method: "put",
  path: "/me/avatar",
  tags: ["people"],
  description: "Replaces the acting guest's photo, cropped to a square.",
  request: {
    headers: idempotencyHeaders,
    body: {
      required: true,
      content: { "multipart/form-data": { schema: avatarForm } },
    },
  },
  responses: {
    200: json(publicProfileSchema, "The profile with its new photo"),
    ...versionConflictResponse(publicProfileSchema),
    ...problemDefault,
  },
});

const removeMyAvatar = createRoute({
  method: "delete",
  path: "/me/avatar",
  tags: ["people"],
  description: "Removes the acting guest's photo.",
  request: {
    headers: idempotencyHeaders,
    query: z.object({ expectedVersion }),
  },
  responses: {
    200: json(publicProfileSchema, "The profile without a photo"),
    ...versionConflictResponse(publicProfileSchema),
    ...problemDefault,
  },
});

export function addPeopleRoutes(app: App, people: () => PeopleUseCases) {
  app.openapi(listEventProfiles, async (c) => {
    const { limit, cursor, eventId } = c.req.valid("query");
    const result = await people().listEventProfiles(c.var.actor, { eventId });
    if (!result.ok) return problem(result.error);
    const page = pageOf(
      result.value,
      { limit, cursor },
      `guests:${eventId}`,
      (g) => [g.id]
    );
    if (!page.ok) return problem(page.error);
    return c.json(
      { ...page.value, items: page.value.items.map(toProfileView) },
      200
    );
  });

  app.openapi(getProfile, async (c) => {
    const result = await people().getProfile(c.var.actor, {
      guestId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(toProfileView(result.value), 200);
  });

  app.openapi(updateMyProfile, async (c) => {
    const result = await people().updateMyProfile(
      c.var.actor,
      c.req.valid("json"),
      c.var.now
    );
    if (!result.ok) return problem(result.error, toProfileView);
    return c.json(toProfileView(result.value), 200);
  });

  app.openapi(replaceMyAvatar, async (c) => {
    const { avatar, expectedVersion } = c.req.valid("form");
    const result = await people().replaceMyAvatar(
      c.var.actor,
      { image: Buffer.from(await avatar.arrayBuffer()), expectedVersion },
      c.var.now
    );
    if (!result.ok) return problem(result.error, toProfileView);
    return c.json(toProfileView(result.value), 200);
  });

  app.openapi(removeMyAvatar, async (c) => {
    const result = await people().removeMyAvatar(
      c.var.actor,
      c.req.valid("query"),
      c.var.now
    );
    if (!result.ok) return problem(result.error, toProfileView);
    return c.json(toProfileView(result.value), 200);
  });
}
