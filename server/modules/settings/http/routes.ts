import { createRoute, z } from "@hono/zod-openapi";
import {
  proxySecretSchema,
  proxySignInInputSchema,
  proxySignInSchema,
  publicSiteSchema,
  siteSettingsSchema,
} from "@schellingboard/contracts/settings";
import { MAX_MAP_BYTES } from "@schellingboard/domain/map-image-constraints";

import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import { type App, json } from "@/server/http/route-parts";

import type { SettingsUseCases } from "../application/use-cases";

const tags = ["admin"];

const settingsForm = z.object({
  title: z.string(),
  description: z.string().optional(),
  image: z
    .instanceof(File)
    .optional()
    .openapi({ type: "string", format: "binary" })
    .describe(
      `The venue map: JPEG, PNG or WebP, at most ${MAX_MAP_BYTES / 1024 / 1024} MiB`
    ),
  removeMap: z
    .enum(["true", "false", "on"])
    .optional()
    .describe("Removes the map when no image is sent"),
});

const getSite = createRoute({
  method: "get",
  path: "/site",
  tags: ["site"],
  description:
    "The site's title, description and venue map, and whether the server can send email.",
  responses: {
    200: json(publicSiteSchema, "The site settings"),
    ...problemDefault,
  },
});

const getSettings = createRoute({
  method: "get",
  path: "/admin/settings",
  tags,
  description: "The site's title, description and venue map.",
  responses: {
    200: json(siteSettingsSchema, "The site settings"),
    ...problemDefault,
  },
});

const updateSettings = createRoute({
  method: "put",
  path: "/admin/settings",
  tags,
  description:
    "Replaces the title and description; the map is replaced by `image`, removed by `removeMap`, or else kept.",
  request: {
    headers: idempotencyHeaders,
    body: {
      required: true,
      content: { "multipart/form-data": { schema: settingsForm } },
    },
  },
  responses: {
    200: json(siteSettingsSchema, "The saved settings"),
    ...problemDefault,
  },
});

const proxyPath = "/admin/proxy-sign-in";

const getProxy = createRoute({
  method: "get",
  path: proxyPath,
  tags,
  description:
    "The sign-in through a proxy, and what this request carried (never the secret).",
  responses: {
    200: json(proxySignInSchema, "The proxy sign-in settings"),
    ...problemDefault,
  },
});

const updateProxy = createRoute({
  method: "put",
  path: proxyPath,
  tags,
  description: "Replaces the proxy sign-in options; the secret is kept.",
  request: {
    headers: idempotencyHeaders,
    body: {
      required: true,
      content: { "application/json": { schema: proxySignInInputSchema } },
    },
  },
  responses: {
    200: json(
      proxySignInSchema.omit({ ownRequest: true }),
      "The saved settings"
    ),
    ...problemDefault,
  },
});

const generateSecret = createRoute({
  method: "post",
  path: `${proxyPath}/secret`,
  tags,
  description:
    "Makes a new secret the proxy must send in `X-SchellingBoard-Proxy-Secret`, replacing any earlier one. It is shown only in this answer.",
  request: { headers: idempotencyHeaders },
  responses: {
    200: json(proxySecretSchema, "The new secret"),
    ...problemDefault,
  },
});

const clearSecret = createRoute({
  method: "delete",
  path: `${proxyPath}/secret`,
  tags,
  description: "Stops requiring a secret of the proxy.",
  request: { headers: idempotencyHeaders },
  responses: {
    204: { description: "The secret is removed" },
    ...problemDefault,
  },
});

export function addSiteRoutes(app: App, settings: () => SettingsUseCases) {
  app.openapi(getSite, async (c) => {
    const result = await settings().getPublicSiteSettings();
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });
}

export function addAdminSettingsRoutes(
  app: App,
  settings: () => SettingsUseCases
) {
  app.openapi(getSettings, async (c) => {
    const result = await settings().getSiteSettings(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(updateSettings, async (c) => {
    const { title, description, image, removeMap } = c.req.valid("form");
    const result = await settings().updateSiteSettings(c.var.actor, {
      title,
      description: description ?? "",
      image:
        image && image.size > 0
          ? Buffer.from(await image.arrayBuffer())
          : undefined,
      removeMap: removeMap === "true" || removeMap === "on",
    });
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(getProxy, async (c) => {
    const { request } = c.var.proxy;
    const result = await settings().getProxySignIn(
      c.var.actor,
      request && {
        headerSeen: request.email !== null,
        trusted: request.trusted,
      }
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(updateProxy, async (c) => {
    const result = await settings().updateProxySignIn(
      c.var.actor,
      c.req.valid("json")
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(generateSecret, async (c) => {
    const result = await settings().generateProxySecret(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(clearSecret, async (c) => {
    const result = await settings().clearProxySecret(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.body(null, 204);
  });
}
