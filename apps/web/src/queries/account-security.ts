import type { ApiClient } from "@schellingboard/api-client";
import type {
  credentialsSchema,
  loginSessionSchema,
} from "@schellingboard/contracts/auth";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type LoginSessionView = (typeof loginSessionSchema)["_output"];

export type AccountSecurityState =
  | { status: "loading" }
  /** `code` says why: a refusal such as "guest.unselected", or a status. */
  | { status: "error"; code: string }
  | ({
      status: "ready";
      sessions: LoginSessionView[];
    } & (typeof credentialsSchema)["_output"]);

/** The sign-in settings of the guest this browser acts as, read together. */
export function createAccountSecurityQuery({ api }: { api: ApiClient }) {
  const state = createObservable<AccountSecurityState>({ status: "loading" });
  let latest = 0;
  let destroyed = false;
  return {
    get: state.get,
    subscribe: state.subscribe,
    destroy() {
      destroyed = true;
    },
    async load() {
      const mine = ++latest;
      try {
        const [credentials, sessions] = await Promise.all([
          api.GET("/api/v1/me/credentials"),
          api.GET("/api/v1/me/login-sessions"),
        ]);
        if (destroyed || mine !== latest) return;
        if (!credentials.data || !sessions.data) {
          const failed = !credentials.data ? credentials : sessions;
          state.set({
            status: "error",
            code: problemCode(failed.error, failed.response.status),
          });
          return;
        }
        state.set({
          status: "ready",
          ...credentials.data,
          sessions: sessions.data,
        });
      } catch {
        if (!destroyed && mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
