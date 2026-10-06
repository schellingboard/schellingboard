import { createRoute, z } from "@hono/zod-openapi";
import { siteSettingsSchema } from "@schellingboard/contracts/settings";
import { MAX_MAP_BYTES } from "@/utils/map-image-constraints";
import { idempotencyHeaders } from "@/server/http/idempotency";
import { problem, problemDefault } from "@/server/http/problem";
import { json, type App } from "@/server/http/route-parts";
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
}
