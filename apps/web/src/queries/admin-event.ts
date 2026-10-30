import type { ApiClient } from "@schellingboard/api-client";
import type { eventDetailSchema } from "@schellingboard/contracts/event";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminEventDetail = (typeof eventDetailSchema)["_output"];

export type AdminEventDay = AdminEventDetail["days"][number];

export type AdminEventState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | ({ status: "ready" } & AdminEventDetail);

export type AdminEventQuery = ReturnType<typeof createAdminEventQuery>;

/** One event with its days; `load` again after a change, which keeps what is shown meanwhile. */
export function createAdminEventQuery({
  api,
  id,
}: {
  api: ApiClient;
  id: string;
}) {
  const state = createObservable<AdminEventState>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const { data, error, response } = await api.GET("/api/v1/events/{id}", {
          params: { path: { id } },
        });
        if (mine !== latest) return;
        state.set(
          data
            ? { status: "ready", ...data }
            : { status: "error", code: problemCode(error, response.status) }
        );
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
