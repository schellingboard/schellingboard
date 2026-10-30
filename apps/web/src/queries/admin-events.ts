import type { ApiClient } from "@schellingboard/api-client";
import type { eventViewSchema } from "@schellingboard/contracts/event";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminEvent = (typeof eventViewSchema)["_output"];

export type AdminEventsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; events: AdminEvent[] };

export type AdminEventsQuery = ReturnType<typeof createAdminEventsQuery>;

/** Every event, past ones included; `load` again after a change. */
export function createAdminEventsQuery({ api }: { api: ApiClient }) {
  const state = createObservable<AdminEventsState>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const { data, error, response } = await api.GET("/api/v1/events");
        if (mine !== latest) return;
        state.set(
          data
            ? { status: "ready", events: data.events }
            : { status: "error", code: problemCode(error, response.status) }
        );
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
