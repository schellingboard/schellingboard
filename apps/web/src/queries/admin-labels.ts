import type { ApiClient } from "@schellingboard/api-client";
import type { eventLabelViewSchema } from "@schellingboard/contracts/event-label";

import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminLabel = (typeof eventLabelViewSchema)["_output"];

export type AdminLabelsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; labels: AdminLabel[] };

export type AdminLabelsQuery = ReturnType<typeof createAdminLabelsQuery>;

/** The labels of the given events, in each event's order; `load` again after a change. */
export function createAdminLabelsQuery({
  api,
  eventIds,
}: {
  api: ApiClient;
  eventIds: string[];
}) {
  const state = createObservable<AdminLabelsState>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const answers = await Promise.all(
          eventIds.map((id) =>
            api.GET("/api/v1/admin/events/{id}/labels", {
              params: { path: { id } },
            })
          )
        );
        if (mine !== latest) return;
        const failed = answers.find((a) => !a.data);
        state.set(
          failed
            ? {
                status: "error",
                code: problemCode(failed.error, failed.response.status),
              }
            : { status: "ready", labels: answers.flatMap((a) => a.data ?? []) }
        );
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
