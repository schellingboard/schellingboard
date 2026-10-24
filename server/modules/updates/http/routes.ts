import { createRoute } from "@hono/zod-openapi";
import { updateStatusSchema } from "@schellingboard/contracts/updates";
import { problem, problemDefault } from "@/server/http/problem";
import { json, type App } from "@/server/http/route-parts";
import type { UpdateUseCases } from "../application/use-cases";

const getUpdates = createRoute({
  method: "get",
  path: "/updates",
  tags: ["admin"],
  description:
    "The running release and the newest published one; null for anyone but the admin, so a page can ask without being refused. The server looks the latest up on GitHub at most once a day (`SB_UPDATE_CHECK=false` turns that off).",
  responses: {
    200: json(
      updateStatusSchema.nullable(),
      "The running and the latest release"
    ),
    ...problemDefault,
  },
});

export function addAdminUpdateRoutes(app: App, updates: () => UpdateUseCases) {
  app.openapi(getUpdates, (c) => {
    const result = updates().getUpdateStatus(c.var.actor);
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });
}
