import { readFile } from "node:fs/promises";
import path from "node:path";
import { Scalar } from "@scalar/hono-api-reference";
import type { MiddlewareHandler } from "hono";
import { ADMIN_COOKIE_NAME } from "@/utils/auth-cookies";
import { AUTH_COOKIE_NAME } from "@/utils/auth";
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

const PUBLIC_PATHS = new Set(["/health", "/auth/site"]);
const HTTP_METHODS = ["get", "put", "post", "delete", "patch"] as const;

export function openApiDocumentOf(app: App, basePath = "/api/v1") {
  const document = app.getOpenAPI31Document({
    openapi: "3.1.0",
    info: { title: "SchellingBoard API", version: "1" },
  });
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    const relative = path.slice(basePath.length);
    if (PUBLIC_PATHS.has(relative)) continue;
    const security: Record<string, string[]>[] = relative.startsWith("/admin/")
      ? [{ adminAuth: [] }]
      : [{ siteAuth: [] }, { adminAuth: [] }];
    for (const method of HTTP_METHODS) {
      const operation = item[method];
      if (operation) operation.security = security;
    }
  }
  document.components = {
    ...document.components,
    securitySchemes: {
      siteAuth: {
        type: "apiKey",
        in: "cookie",
        name: AUTH_COOKIE_NAME,
        description:
          "Set by the site's password page. Only needed when the site has a password.",
      },
      adminAuth: {
        type: "apiKey",
        in: "cookie",
        name: ADMIN_COOKIE_NAME,
        description:
          "Set by logging in at /admin, or by POST /api/auth/login with scope admin. The browser sends it by itself.",
      },
    },
  };
  return document;
}

let scalarBundle: Promise<string> | undefined;

export function addApiDocsRoutes(app: App, basePath: string) {
  let document: ReturnType<typeof openApiDocumentOf> | undefined;

  const enabled: MiddlewareHandler = (c, next) =>
    isApiDocsEnabled() ? next() : Promise.resolve(c.notFound());

  app.get("/openapi.json", enabled, (c) =>
    c.json((document ??= openApiDocumentOf(app, basePath)))
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
