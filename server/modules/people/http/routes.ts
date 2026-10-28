import { createRoute, z } from "@hono/zod-openapi";
import { pageQuerySchema } from "@schellingboard/contracts/cursor-page";
import {
  chooseGuestBodySchema,
  currentIdentitySchema,
  identitySchema,
} from "@schellingboard/contracts/auth";
import {
  attendeeListSchema,
  profileActivitySchema,
  profileBodySchema,
  publicProfileListSchema,
  publicProfileSchema,
} from "@schellingboard/contracts/guest";
import { MIN_AVATAR_WIDTH } from "@schellingboard/domain/avatar-image";
import { MAX_IMAGE_BYTES } from "@/utils/images";
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
  textExpectedVersion as expectedVersion,
  type App,
} from "@/server/http/route-parts";
import type { PeopleUseCases } from "../application/use-cases";
import { toAttendeeView, toProfileView } from "./view";
import { setGuestCookie } from "./guest-cookie";

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

const listAttendees = createRoute({
  method: "get",
  path: "/attendees",
  tags: ["people"],
  description:
    "Every guest of the site with the public profile, in id order: the people directory.",
  request: { query: pageQuerySchema },
  responses: {
    200: json(attendeeListSchema, "The directory"),
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

const getProfileActivity = createRoute({
  method: "get",
  path: "/guests/{id}/activity",
  tags: ["people"],
  description:
    "What a guest hosts and has proposed, at every event: the profile's Hosting and Proposals.",
  request: { params: idParam },
  responses: {
    200: json(profileActivitySchema, "The guest's sessions and proposals"),
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

const getIdentity = createRoute({
  method: "get",
  path: "/me/identity",
  tags: ["people"],
  description:
    "The guest this browser acts as, or null; a protected name counts only once logged in.",
  responses: {
    200: json(currentIdentitySchema, "The current guest"),
    ...problemDefault,
  },
});

const chooseIdentity = createRoute({
  method: "put",
  path: "/me/identity",
  tags: ["people"],
  description:
    "Makes this browser act as an open guest name (sets the guest cookie). A protected name answers 403 `guest.protected`: send the user to the login page.",
  request: { body: body(chooseGuestBodySchema) },
  responses: {
    200: json(identitySchema, "The guest the browser now acts as"),
    ...problemDefault,
  },
});

const signOutIdentity = createRoute({
  method: "delete",
  path: "/me/identity",
  tags: ["people"],
  description:
    "Signs the browser out of its guest name (clears the guest cookie).",
  responses: { 200: json(identitySchema, "Signed out"), ...problemDefault },
});

export function addPeopleRoutes(app: App, people: () => PeopleUseCases) {
  app.openapi(getIdentity, async (c) =>
    c.json(await people().currentGuest(c.var.actor), 200)
  );

  app.openapi(chooseIdentity, async (c) => {
    const result = await people().chooseGuest(c.var.actor, c.req.valid("json"));
    if (!result.ok) return problem(result.error);
    await setGuestCookie(c, result.value);
    return c.json({ guestId: result.value.guestId }, 200);
  });

  app.openapi(signOutIdentity, async (c) => {
    await setGuestCookie(c, people().signOut());
    return c.json({ guestId: null }, 200);
  });

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

  app.openapi(listAttendees, async (c) => {
    const { limit, cursor } = c.req.valid("query");
    const result = await people().listAttendees(c.var.actor, c.var.now);
    if (!result.ok) return problem(result.error);
    const page = pageOf(result.value, { limit, cursor }, "attendees", (a) => [
      a.id,
    ]);
    if (!page.ok) return problem(page.error);
    return c.json(
      { ...page.value, items: page.value.items.map(toAttendeeView) },
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

  app.openapi(getProfileActivity, async (c) => {
    const result = await people().getProfileActivity(c.var.actor, {
      guestId: c.req.valid("param").id,
    });
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
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
