import { getRepositories } from "@/db/container";

import type { Actor } from "./actor";
import { inspectProxyRequest, type ProxyRequest } from "./proxy-sign-in";

export type ProxyIdentity = {
  /** What the header and trust checks said; null while the setting is off. */
  request: ProxyRequest | null;
  /** The person the header names, only for a trusted request of known origin. */
  guestId: string | null;
  siteAdmins: boolean;
};

export async function readProxyIdentity(
  req: Request,
  remoteAddress: string | undefined,
  trustedOrigin: boolean
): Promise<ProxyIdentity> {
  const { settings, guests } = getRepositories();
  const config = await settings.getProxySignIn();
  const request = inspectProxyRequest(
    config,
    config.secretSet ? await settings.getProxySecretHash() : null,
    req.headers,
    remoteAddress
  );
  const email = request?.trusted && trustedOrigin ? request.email : null;
  const guest = email ? await guests.findByEmail(email) : undefined;
  return {
    request,
    guestId: guest?.id ?? null,
    siteAdmins: config.siteAdmins,
  };
}

/**
 * The header wins over a cookie session of someone else, which ends here. A
 * session of the same person stays, for its site-admin role: the proxy gives
 * that role only where the setting says so.
 */
export async function withProxyIdentity(
  actor: Actor,
  proxy: ProxyIdentity
): Promise<Actor> {
  if (!proxy.guestId) return actor;
  const { guests, loginSessions } = getRepositories();
  const cookie = actor.guest;
  if (cookie && cookie.id !== proxy.guestId && cookie.sessionId)
    await loginSessions.delete(cookie.sessionId);
  const kept = cookie?.id === proxy.guestId && cookie.level === "verified";
  const siteAdmin =
    (kept && cookie.siteAdmin === true) ||
    (proxy.siteAdmins && (await guests.getSiteAdmin(proxy.guestId)));
  return {
    admin: siteAdmin,
    guest: {
      id: proxy.guestId,
      level: "verified",
      via: "proxy",
      siteAdmin,
    },
  };
}
