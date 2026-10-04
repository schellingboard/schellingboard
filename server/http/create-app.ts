import { OpenAPIHono } from "@hono/zod-openapi";
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
  app.notFound(() => problemResponse({ status: 404, code: "route.notFound" }));
  app.onError((error) => {
    console.error(error);
    return problemResponse({ status: 500, code: "server.error" });
  });
  return app;
}
