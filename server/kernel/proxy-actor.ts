import { isEmail, MAX_NAME_LENGTH } from "@schellingboard/contracts/guest";

import { getRepositories } from "@/db/container";

import type { Actor } from "./actor";
import { makePerson } from "./make-person";
import { inspectProxyRequest, type ProxyRequest } from "./proxy-sign-in";
import { unitOfWork } from "./unit-of-work";

export type ProxyIdentity = {
  /** What the header and trust checks said; null while the setting is off. */
  request: ProxyRequest | null;
  /** The person the header names, only for a trusted request of known origin. */
  guestId: string | null;
  /** A trusted email that no person has, and that no one was made for. */
  unknownEmail: boolean;
  siteAdmins: boolean;
};

/** The name header's value, else the email up to its `@`. */
export function proxyPersonName(email: string, headerValue: string | null) {
  // Headers reach us as latin1; proxies send the name as UTF-8 bytes.
  const given = headerValue
    ? Buffer.from(headerValue, "latin1").toString("utf8").trim()
    : "";
  return (
    given.slice(0, MAX_NAME_LENGTH) ||
    email.split("@")[0].slice(0, MAX_NAME_LENGTH) ||
    email
  );
}

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
  let guest = email ? await guests.findByEmail(email) : undefined;
  if (email && !guest && config.createPeople && isEmail(email)) {
    const header = config.nameHeader
      ? req.headers.get(config.nameHeader)
      : null;
    guest = (
      await unitOfWork.run((tx) =>
        makePerson(
          tx,
          {
            name: proxyPersonName(email, header),
            email,
            eventIds: [],
            nameUnconfirmed: true,
          },
          { actor: { type: "system" }, at: new Date() }
        )
      )
    ).guest;
  }
  return {
    request,
    guestId: guest?.id ?? null,
    unknownEmail: email !== null && !guest,
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
  // An admin's own session stays: else a proxy email the site does not know
  // would lock out the one person who can change the setting.
  if (proxy.unknownEmail)
    return actor.admin ? actor : { admin: false, guest: null };
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
      // Lets Log out end the cookie session this request keeps.
      ...(cookie?.id === proxy.guestId && { sessionId: cookie.sessionId }),
    },
  };
}
