import { createHash } from "node:crypto";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import type { Repositories } from "@/db/container";
import type { Actor } from "@/server/kernel/actor";
import { IDEMPOTENCY_TTL_MS } from "@/utils/jobs/idempotency";
import type { ApiEnv } from "./actor";
import { problemResponse } from "./problem";

// A request still unfinished after this is taken to have died with its process,
// so a retry runs again instead of getting 409 until the row expires.
const ABANDONED_AFTER_MS = 60 * 1000;
const MAX_KEY_LENGTH = 255;
const MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Requests with neither admin nor guest have no one to scope a key to, so for
// them the key is ignored rather than shared by every anonymous client.
function actorScope({ admin, guest }: Actor): string | null {
  if (!admin && !guest) return null;
  return `${admin ? "admin" : "-"}:${guest ? `${guest.level}:${guest.id}` : "-"}`;
}

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

// ADR 0012 section 5. Runs after the actor middleware, which it scopes keys by.
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
    const repo = store();
    const at = now();
    const claim = await repo.claim(
      {
        actor,
        key,
        method: c.req.method,
        path: pathAndQuery(c.req.url),
        bodyHash: await bodyHash(c.req.raw),
      },
      at,
      {
        expiredBefore: new Date(at.getTime() - IDEMPOTENCY_TTL_MS),
        abandonedBefore: new Date(at.getTime() - ABANDONED_AFTER_MS),
      }
    );
    const owner = { actor, key, claimedAt: at };
    switch (claim.state) {
      case "keyReused":
        return problemResponse({ status: 422, code: "idempotency.keyReused" });
      case "inProgress":
        return problemResponse({ status: 409, code: "idempotency.inProgress" });
      case "done": {
        const { status, headers, body } = claim.response;
        return new Response(body, { status, headers });
      }
    }

    try {
      await next();
    } catch (error) {
      await repo.release(owner);
      throw error;
    }
    if (c.res.status >= 500) {
      await repo.release(owner);
      return;
    }
    const headers = Object.fromEntries(c.res.headers);
    delete headers["set-cookie"];
    const text = await c.res.clone().text();
    await repo.complete(owner, {
      status: c.res.status,
      headers,
      body: text === "" ? null : text,
    });
  });
}
