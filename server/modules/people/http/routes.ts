import { createRoute, z } from "@hono/zod-openapi";
import {
  profileBodySchema,
  publicProfileSchema,
} from "@schellingboard/contracts/guest";
import { MIN_AVATAR_WIDTH } from "@/utils/avatar-image-constraints";
import { MAX_IMAGE_BYTES } from "@/utils/images";
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
import { toProfileView } from "./view";

const avatarForm = z.object({
  avatar: z
    .instanceof(File)
    .openapi({ type: "string", format: "binary" })
    .describe(
      `JPEG, PNG or WebP, at most ${MAX_IMAGE_BYTES / 1024 / 1024} MiB, at least ${MIN_AVATAR_WIDTH} px square`
    ),
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
    ...problemDefault,
  },
});

const removeMyAvatar = createRoute({
  method: "delete",
  path: "/me/avatar",
  tags: ["people"],
  description: "Removes the acting guest's photo.",
  request: { headers: idempotencyHeaders },
  responses: { 204: noContent("Removed"), ...problemDefault },
});

export function addPeopleRoutes(app: App, people: () => PeopleUseCases) {
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
    if (!result.ok) return problem(result.error);
    return c.json(toProfileView(result.value), 200);
  });

  app.openapi(replaceMyAvatar, async (c) => {
    const { avatar } = c.req.valid("form");
    const result = await people().replaceMyAvatar(
      c.var.actor,
      { image: Buffer.from(await avatar.arrayBuffer()) },
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    return c.json(toProfileView(result.value), 200);
  });

  app.openapi(removeMyAvatar, async (c) => {
    const result = await people().removeMyAvatar(c.var.actor, c.var.now);
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
