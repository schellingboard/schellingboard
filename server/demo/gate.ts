import { Hono } from "hono";

import { problemResponse } from "@/server/http/problem";

import { withBanner } from "./banner";

type Method = "put" | "post" | "delete";

// Spelled as in the OpenAPI document, so a test notices a renamed path. Denied for
// every account: a visitor protecting a shared name would lock the rest out.
export const DENIED_OPERATIONS: { method: Method; path: string }[] = [
  { method: "put", path: "/api/v1/me/credentials/password" },
  { method: "post", path: "/api/v1/me/credentials/password" },
  { method: "post", path: "/api/v1/me/credentials/unprotect" },
  { method: "put", path: "/api/v1/me/credentials/username" },
  { method: "put", path: "/api/v1/admin/guests/{id}/site-admin" },
  { method: "put", path: "/api/v1/me/avatar" },
  { method: "delete", path: "/api/v1/me/avatar" },
  { method: "put", path: "/api/v1/admin/locations/{id}/image" },
];

const BODY_LIMIT = 10 * 1024 * 1024;

const featureDisabled = () =>
  problemResponse({
    status: 403,
    code: "site.featureDisabled",
    detail: "This is turned off on this site.",
  });

const mediaType = (req: Request) =>
  (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();

// A body that is not what it claims to be is left to the app to refuse.
async function uploadsMap(req: Request): Promise<boolean> {
  if (mediaType(req) !== "multipart/form-data") return false;
  if (Number(req.headers.get("content-length") ?? 0) > BODY_LIMIT) return true;
  try {
    const image = (await req.clone().formData()).get("image");
    return image instanceof File && image.size > 0;
  } catch {
    return false;
  }
}

async function setsUsername(req: Request): Promise<boolean> {
  if (mediaType(req) !== "application/json") return false;
  if (Number(req.headers.get("content-length") ?? 0) > BODY_LIMIT) return true;
  try {
    const body: unknown = await req.clone().json();
    return typeof body === "object" && body !== null && "username" in body;
  } catch {
    return false;
  }
}

export function demoGate({
  inner,
  nextReset,
}: {
  inner: (req: Request) => Response | Promise<Response>;
  nextReset: () => Date;
}) {
  const gate = new Hono();

  gate.use("*", async (c, next) => {
    await next();
    const res = new Response(c.res.body, c.res);
    res.headers.set("X-Robots-Tag", "noindex");
    c.res = res;
  });

  gate.get("/demo/status", (c) =>
    c.json(
      {
        msUntilReset: Math.max(0, nextReset().getTime() - Date.now()),
      },
      200,
      {
        "cache-control": "no-store",
      }
    )
  );

  // Routed by Hono like `web` routes them, so an encoded path cannot slip by.
  for (const { method, path } of DENIED_OPERATIONS) {
    gate.on(method.toUpperCase(), path.replace(/\{(\w+)\}/g, ":$1"), () =>
      featureDisabled()
    );
  }
  gate.put("/api/v1/admin/settings", async (c, next) =>
    (await uploadsMap(c.req.raw)) ? featureDisabled() : next()
  );
  gate.put("/api/v1/admin/guests/:id", async (c, next) =>
    (await setsUsername(c.req.raw)) ? featureDisabled() : next()
  );

  gate.all("*", async (c) => {
    const res = await inner(c.req.raw);
    const isPage =
      res.status === 200 &&
      c.req.method === "GET" &&
      (res.headers.get("content-type") ?? "").startsWith("text/html");
    if (!isPage) return res;
    const page = new Response(withBanner(await res.text()), res);
    page.headers.delete("content-length");
    return page;
  });

  return (req: Request) => gate.fetch(req);
}
