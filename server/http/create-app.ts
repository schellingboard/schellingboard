import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import type { ApiEnv } from "./actor";
import { problemResponse } from "./problem";

export function createApp(basePath = "/") {
  const app = new OpenAPIHono<ApiEnv>({
    defaultHook: (result) => {
      if (result.success) return undefined;
      return problemResponse({
        status: 400,
        code: "request.invalid",
        errors: result.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    },
  }).basePath(basePath);
  // Without an explicit no-store, browsers heuristically cache reads and show
  // stale data after a reload.
  app.use("*", async (c, next) => {
    await next();
    if (!c.res.headers.has("cache-control")) {
      c.res.headers.set("cache-control", "no-store");
    }
  });
  app.notFound(() => problemResponse({ status: 404, code: "route.notFound" }));
  app.onError((error) => {
    // Hono's validators throw these for a body they cannot parse at all.
    if (error instanceof HTTPException && error.status < 500)
      return problemResponse({
        status: error.status,
        code: "request.invalid",
        detail: error.message,
      });
    console.error(error);
    return problemResponse({ status: 500, code: "server.error" });
  });
  return app;
}
