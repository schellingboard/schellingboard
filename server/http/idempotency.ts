import { createHash } from "node:crypto";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import type { Repositories } from "@/db/container";
import {
  actorScope,
  MAX_KEY_LENGTH,
  runIdempotent,
} from "@/server/kernel/idempotency";
import type { ApiEnv } from "./actor";
import { problemResponse } from "./problem";

const MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Their effect is a Set-Cookie, which a replay would not repeat; PUT and DELETE
// on them are naturally idempotent, so a retry just runs again.
export const IDEMPOTENCY_EXEMPT_PATHS = ["/api/v1/me/identity"];

// Declared on each mutating route so the OpenAPI document shows it.
export const idempotencyHeaders = z.object({
  "idempotency-key": z
    .string()
    .min(1)
    .max(MAX_KEY_LENGTH)
    .optional()
    .describe("Retries with the same key get the first response (24 h)"),
});

function pathAndQuery(url: string): string {
  const { pathname, search } = new URL(url);
  return pathname + search;
}

const sha256 = (data: string | ArrayBuffer) =>
  createHash("sha256")
    .update(typeof data === "string" ? data : Buffer.from(data))
    .digest("hex");

// Clients pick a new multipart boundary per attempt, so a form is hashed by its
// parsed fields, not its bytes. A body that fails to parse is hashed as bytes.
async function bodyHash(req: Request): Promise<string> {
  const isForm = req.headers
    .get("content-type")
    ?.toLowerCase()
    .startsWith("multipart/form-data");
  if (isForm) {
    try {
      const form = await req.clone().formData();
      const fields = await Promise.all(
        [...form].map(async ([name, value]) =>
          typeof value === "string"
            ? [name, value]
            : [name, value.name, value.type, sha256(await value.arrayBuffer())]
        )
      );
      return sha256(JSON.stringify(fields));
    } catch {}
  }
  return sha256(await req.clone().arrayBuffer());
}

// Runs after the actor middleware, which it scopes keys by.
export function idempotencyMiddleware({
  store,
  now = () => new Date(),
}: {
  store: () => Repositories["idempotency"];
  now?: () => Date;
}) {
  return createMiddleware<ApiEnv>(async (c, next) => {
    const key = c.req.header("idempotency-key");
    if (key === undefined || !MUTATIONS.has(c.req.method)) return next();
    if (IDEMPOTENCY_EXEMPT_PATHS.includes(new URL(c.req.url).pathname))
      return next();
    if (key === "" || key.length > MAX_KEY_LENGTH) {
      return problemResponse({
        status: 400,
        code: "request.invalid",
        errors: [
          {
            path: "Idempotency-Key",
            message: `Must be 1 to ${MAX_KEY_LENGTH} characters`,
          },
        ],
      });
    }

    const actor = actorScope(c.var.actor);
    if (actor === null) return next();
    const outcome = await runIdempotent(
      store(),
      {
        actor,
        key,
        method: c.req.method,
        path: pathAndQuery(c.req.url),
        bodyHash: await bodyHash(c.req.raw),
      },
      now(),
      async () => {
        await next();
        if (c.res.status >= 500) return { value: undefined, response: null };
        const headers = Object.fromEntries(c.res.headers);
        delete headers["set-cookie"];
        const text = await c.res.clone().text();
        return {
          value: undefined,
          response: {
            status: c.res.status,
            headers,
            body: text === "" ? null : text,
          },
        };
      }
    );
    switch (outcome.state) {
      case "keyReused":
        return problemResponse({ status: 422, code: "idempotency.keyReused" });
      case "inProgress":
        return problemResponse({ status: 409, code: "idempotency.inProgress" });
      case "replayed": {
        const { status, headers, body } = outcome.response;
        return new Response(body, { status, headers });
      }
      case "ran":
        return;
    }
  });
}
