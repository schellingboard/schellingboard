import type { ApiClient } from "@schellingboard/api-client";
import type { proxySignInSchema } from "@schellingboard/contracts/settings";

import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type ProxySignInSettings = (typeof proxySignInSchema)["_output"];

export type ProxySignInState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; settings: ProxySignInSettings };

export type ProxySignInQuery = ReturnType<typeof createProxySignInQuery>;

/** The proxy sign-in options and what the admin's own request carried; `load` again after a change. */
export function createProxySignInQuery({ api }: { api: ApiClient }) {
  const state = createObservable<ProxySignInState>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const { data, error, response } = await api.GET(
          "/api/v1/admin/proxy-sign-in"
        );
        if (mine !== latest) return;
        state.set(
          data
            ? { status: "ready", settings: data }
            : { status: "error", code: problemCode(error, response.status) }
        );
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
