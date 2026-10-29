import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type Unavailability = {
  id: string;
  locationId: string;
  start: string;
  end: string;
};

export type AdminUnavailabilityState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; periods: Unavailability[] };

export type AdminUnavailabilityQuery = ReturnType<
  typeof createAdminUnavailabilityQuery
>;

/** When the event's locations cannot be booked; `load` again after a change. */
export function createAdminUnavailabilityQuery({
  api,
  eventId,
}: {
  api: ApiClient;
  eventId: string;
}) {
  const state = createObservable<AdminUnavailabilityState>({
    status: "loading",
  });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const { data, error, response } = await api.GET(
          "/api/v1/admin/events/{id}/location-unavailability",
          { params: { path: { id: eventId } } }
        );
        if (mine !== latest) return;
        state.set(
          data
            ? {
                status: "ready",
                periods: data.periods.map((p) => ({
                  id: p.id,
                  locationId: p.locationId,
                  start: p.start,
                  end: p.end,
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
