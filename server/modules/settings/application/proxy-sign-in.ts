import { randomBytes } from "node:crypto";

import {
  proxyHeaderNameProblem,
  type ProxySignIn,
  type ProxySignInState,
} from "@schellingboard/domain/proxy-sign-in";

import type { Actor } from "@/server/kernel/actor";
import {
  hashProxySecret,
  normalizeAddress,
  proxyAddressProblem,
} from "@/server/kernel/proxy-sign-in";
import { forbidden, invalid, ok, type Result } from "@/server/kernel/result";

import type { SettingsDeps } from "../ports";

/** What the admin's own request carried; null while the sign-in is off. */
export type OwnProxyRequest = { headerSeen: boolean; trusted: boolean } | null;

const adminRequired = () => forbidden("admin.required", "Unauthorized");

export const getProxySignIn =
  ({ repos }: SettingsDeps) =>
  async (
    actor: Actor,
    own: OwnProxyRequest
  ): Promise<Result<ProxySignInState & { ownRequest: OwnProxyRequest }>> => {
    if (!actor.admin) return adminRequired();
    return ok({ ...(await repos.settings.getProxySignIn()), ownRequest: own });
  };

export const updateProxySignIn =
  ({ uow }: SettingsDeps) =>
  async (
    actor: Actor,
    input: ProxySignIn
  ): Promise<Result<ProxySignInState>> => {
    if (!actor.admin) return adminRequired();
    const headerName = input.headerName.trim();
    const problem = proxyHeaderNameProblem(headerName);
    if (problem) return invalid("settings.proxyHeaderInvalid", problem);
    const nameHeader = input.nameHeader.trim();
    const nameProblem = nameHeader && proxyHeaderNameProblem(nameHeader);
    if (nameProblem)
      return invalid("settings.proxyNameHeaderInvalid", nameProblem);
    const addresses = input.addresses
      .map((a) => a.trim())
      .filter((a) => a !== "");
    const bad = addresses.find((a) => proxyAddressProblem(a));
    if (bad !== undefined)
      return invalid(
        "settings.proxyAddressInvalid",
        `Not an IP address or range: ${bad}`
      );
    const logoutUrl = input.logoutUrl.trim();
    if (logoutUrl !== "" && !/^https?:\/\/\S+$/i.test(logoutUrl))
      return invalid(
        "settings.proxyLogoutUrlInvalid",
        "The logout address must start with http:// or https://"
      );
    return uow.run(async (tx) =>
      ok(
        await tx.settings.updateProxySignIn({
          enabled: input.enabled,
          headerName,
          addresses: addresses.map((a) =>
            a.includes("/") ? a : normalizeAddress(a)
          ),
          logoutUrl,
          siteAdmins: input.siteAdmins,
          createPeople: input.createPeople,
          nameHeader,
        })
      )
    );
  };

/** The secret is returned here and never again; only its hash is kept. */
export const generateProxySecret =
  ({ uow }: SettingsDeps) =>
  async (actor: Actor): Promise<Result<{ secret: string }>> => {
    if (!actor.admin) return adminRequired();
    const secret = randomBytes(32).toString("base64url");
    await uow.run((tx) =>
      tx.settings.setProxySecretHash(hashProxySecret(secret))
    );
    return ok({ secret });
  };

export const clearProxySecret =
  ({ uow }: SettingsDeps) =>
  async (actor: Actor): Promise<Result<null>> => {
    if (!actor.admin) return adminRequired();
    await uow.run((tx) => tx.settings.setProxySecretHash(null));
    return ok(null);
  };
