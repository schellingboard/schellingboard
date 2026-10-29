import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { actorOf } from "@/server/kernel/session-actor";
import type { Actor } from "@/server/kernel/actor";
import { requestNow } from "@/utils/dev-clock";

export type ApiEnv = { Variables: { actor: Actor; now: Date } };

export const actorMiddleware = createMiddleware<ApiEnv>(async (c, next) => {
  c.set(
    "actor",
    await actorOf({
      get: (name) => {
        const value = getCookie(c, name);
        return value === undefined ? undefined : { value };
      },
    })
  );
  c.set("now", requestNow(c.req.raw));
  await next();
});
