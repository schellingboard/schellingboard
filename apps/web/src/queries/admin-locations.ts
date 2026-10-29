import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminLocation = {
  id: string;
  name: string;
  description: string;
  areaDescription: string | null;
  capacity: number;
  color: string;
  bookable: boolean;
  imageUrl: string;
  eventIds: string[];
  sessionCount: number;
  version: number;
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
                  description: l.description,
                  areaDescription: l.areaDescription,
                  capacity: l.capacity,
                  color: l.color,
                  bookable: l.bookable,
                  imageUrl: l.imageUrl,
                  eventIds: l.eventIds,
                  sessionCount: l.sessionCount ?? 0,
                  version: l.version,
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
