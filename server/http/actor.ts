import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { resolveActor, type Actor } from "@/server/kernel/actor";

export type ApiEnv = { Variables: { actor: Actor } };

export const actorMiddleware = createMiddleware<ApiEnv>(async (c, next) => {
  c.set(
    "actor",
    await resolveActor({
      get: (name) => {
        const value = getCookie(c, name);
        return value === undefined ? undefined : { value };
      },
    })
  );
  await next();
});
