import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminLocation = {
  id: string;
  name: string;
  capacity: number;
  eventIds: string[];
};

export type AdminLocationsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; locations: AdminLocation[] };

export type AdminLocationsQuery = ReturnType<typeof createAdminLocationsQuery>;

/** Every location, hidden ones included, with the events they are assigned to. */
export function createAdminLocationsQuery({ api }: { api: ApiClient }) {
  const state = createObservable<AdminLocationsState>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const { data, error, response } = await api.GET(
          "/api/v1/admin/locations",
          { params: { query: {} } }
        );
        if (mine !== latest) return;
        state.set(
          data
            ? {
                status: "ready",
                locations: data.locations.map((l) => ({
                  id: l.id,
                  name: l.name,
                  capacity: l.capacity,
                  eventIds: l.eventIds,
                })),
              }
            : { status: "error", code: problemCode(error, response.status) }
        );
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
