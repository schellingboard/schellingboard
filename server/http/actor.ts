import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import type { Actor } from "@/server/kernel/actor";
import {
  type ProxyIdentity,
  readProxyIdentity,
  withProxyIdentity,
} from "@/server/kernel/proxy-actor";
import { actorOf } from "@/server/kernel/session-actor";
import { requestNow } from "@/utils/dev-clock";

import { isTrustedOrigin } from "./gates";

export type ApiEnv = {
  Variables: { actor: Actor; now: Date; proxy: ProxyIdentity };
  /** What the web layer already read of the proxy header, which needs the socket. */
  Bindings: { proxy?: ProxyIdentity };
};

export const actorMiddleware = createMiddleware<ApiEnv>(async (c, next) => {
  const proxy =
    c.env?.proxy ??
    (await readProxyIdentity(c.req.raw, undefined, isTrustedOrigin(c.req.raw)));
  const fromCookie = await actorOf({
    get: (name) => {
      const value = getCookie(c, name);
      return value === undefined ? undefined : { value };
    },
  });
  c.set("proxy", proxy);
  c.set("actor", await withProxyIdentity(fromCookie, proxy));
  c.set("now", requestNow(c.req.raw));
  await next();
});
