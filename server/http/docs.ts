import { readFile } from "node:fs/promises";
import path from "node:path";
import { Scalar } from "@scalar/hono-api-reference";
import type { MiddlewareHandler } from "hono";
import type { createApp } from "./create-app";

type App = ReturnType<typeof createApp>;

// next.config.js traces this file into the standalone build.
const SCALAR_BUNDLE = path.join(
  process.cwd(),
  "node_modules/@scalar/api-reference/dist/browser/standalone.js"
);

export function isApiDocsEnabled(): boolean {
  const value = process.env.API_DOCS?.trim().toLowerCase();
  return value !== "false" && value !== "0";
}

export function openApiDocumentOf(app: App) {
  return app.getOpenAPI31Document({
    openapi: "3.1.0",
    info: { title: "SchellingBoard API", version: "1" },
  });
}

let scalarBundle: Promise<string> | undefined;

export function addApiDocsRoutes(app: App, basePath: string) {
  let document: ReturnType<typeof openApiDocumentOf> | undefined;

  const enabled: MiddlewareHandler = (c, next) =>
    isApiDocsEnabled() ? next() : Promise.resolve(c.notFound());

  app.get("/openapi.json", enabled, (c) =>
    c.json((document ??= openApiDocumentOf(app)))
  );

  // The page runs on the site's origin with the visitor's cookies, so its
  // script is served from here rather than a CDN, and calls nothing outside.
  app.get(
    "/docs",
    enabled,
    Scalar({
      pageTitle: "SchellingBoard API",
      url: `${basePath}/openapi.json`,
      cdn: `${basePath}/docs/scalar.js`,
      telemetry: false,
      withDefaultFonts: false,
      showDeveloperTools: "never",
      agent: { disabled: true },
    })
  );

  app.get("/docs/scalar.js", enabled, async (c) => {
    scalarBundle ??= readFile(SCALAR_BUNDLE, "utf8");
    c.header("content-type", "text/javascript; charset=utf-8");
    c.header("cache-control", "private, max-age=3600");
    return c.body(await scalarBundle);
  });
}
