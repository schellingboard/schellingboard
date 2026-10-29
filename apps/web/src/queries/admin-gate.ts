import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminGateState =
  | { status: "loading" }
  | { status: "open"; title: string }
  | { status: "refused" }
  | { status: "error"; code: string };

export type AdminGate = ReturnType<typeof createAdminGate>;

/** Whether the browser may use the admin section, found by making an admin read. */
export function createAdminGate({ api }: { api: ApiClient }) {
  const state = createObservable<AdminGateState>({ status: "loading" });
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      let next: AdminGateState;
      try {
        const { data, error, response } = await api.GET(
          "/api/v1/admin/settings"
        );
        if (data) next = { status: "open", title: data.title };
        else if (response.status === 401 || response.status === 403)
          next = { status: "refused" };
        else
          next = { status: "error", code: problemCode(error, response.status) };
      } catch {
        next = { status: "error", code: "unreachable" };
      }
      state.set(next);
    },
  };
}
