import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminGuest = {
  id: string;
  name: string;
  email: string;
  eventIds: string[];
};

export type AdminGuestsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; guests: AdminGuest[] };

export type AdminGuestsQuery = ReturnType<typeof createAdminGuestsQuery>;

/** Every guest with the events they belong to; `load` again after a change. */
export function createAdminGuestsQuery({ api }: { api: ApiClient }) {
  const state = createObservable<AdminGuestsState>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const guests: AdminGuest[] = [];
        let cursor: string | undefined;
        do {
          const { data, error, response } = await api.GET(
            "/api/v1/admin/guests",
            { params: { query: { cursor } } }
          );
          if (mine !== latest) return;
          if (!data) {
            state.set({
              status: "error",
              code: problemCode(error, response.status),
            });
            return;
          }
          for (const g of data.items)
            guests.push({
              id: g.id,
              name: g.name,
              email: g.email,
              eventIds: g.eventIds,
            });
          cursor = data.nextCursor ?? undefined;
        } while (cursor);
        state.set({ status: "ready", guests });
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
