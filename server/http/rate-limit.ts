import { createMiddleware } from "hono/factory";
import type { Actor } from "@/server/kernel/actor";
import {
  apiLimit,
  authApiLimit,
  clientIp,
  takeToken,
} from "@/server/kernel/rate-limit";
import type { ApiEnv } from "./actor";
import { problemResponse } from "./problem";

function bucketKey(actor: Actor, headers: Headers) {
  if (actor.admin) return "api:admin";
  // An open name is unsigned, so any id would buy a fresh bucket.
  if (actor.guest?.level === "verified") return `api:guest:${actor.guest.id}`;
  return `api:ip:${clientIp(headers)}`;
}

function limited(wait: number) {
  const res = problemResponse({
    status: 429,
    code: "rate.limited",
    detail: "Too many requests; retry after the time in Retry-After",
  });
  res.headers.set("retry-after", String(wait));
  return res;
}

export const authRateLimitMiddleware = createMiddleware<ApiEnv>(
  async (c, next) => {
    // Without a trusted proxy every visitor is "unknown": one shared bucket
    // would let a single client block everyone's sign-in. The per-guest and
    // per-scope login limits still apply.
    const ip = clientIp(c.req.raw.headers);
    if (ip === "unknown") return next();
    const wait = takeToken(`auth:ip:${ip}`, authApiLimit());
    return wait === 0 ? next() : limited(wait);
  }
);

export const rateLimitMiddleware = (exempt: string[]) =>
  createMiddleware<ApiEnv>(async (c, next) => {
    if (exempt.includes(c.req.path)) return next();
    const wait = takeToken(
      bucketKey(c.var.actor, c.req.raw.headers),
      apiLimit()
    );
    if (wait === 0) return next();
    return limited(wait);
  });
