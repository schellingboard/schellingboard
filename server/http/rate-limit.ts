import { createMiddleware } from "hono/factory";
import type { Actor } from "@/server/kernel/actor";
import { API_LIMIT, clientIp, takeToken } from "@/server/kernel/rate-limit";
import type { ApiEnv } from "./actor";
import { problemResponse } from "./problem";

function bucketKey(actor: Actor, headers: Headers) {
  if (actor.admin) return "api:admin";
  // An open name is unsigned, so any id would buy a fresh bucket.
  if (actor.guest?.level === "verified") return `api:guest:${actor.guest.id}`;
  return `api:ip:${clientIp(headers)}`;
}

export const rateLimitMiddleware = (exempt: string[]) =>
  createMiddleware<ApiEnv>(async (c, next) => {
    if (exempt.includes(c.req.path)) return next();
    const wait = takeToken(
      bucketKey(c.var.actor, c.req.raw.headers),
      API_LIMIT
    );
    if (wait === 0) return next();
    const res = problemResponse({
      status: 429,
      code: "rate.limited",
      detail: "Too many requests; retry after the time in Retry-After",
    });
    res.headers.set("retry-after", String(wait));
    return res;
  });
