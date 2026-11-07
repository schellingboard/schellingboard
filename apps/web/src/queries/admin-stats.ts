import type { ApiClient } from "@schellingboard/api-client";
import type { EventStatistics } from "@schellingboard/contracts/stats";
import {
  SESSION_ORIGINS,
  type SessionOrigin,
} from "@schellingboard/domain/stats/session-origin";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type StatsFilter = {
  excludeLocations: string[];
  excludeHosts: string[];
  excludeOrigins: SessionOrigin[];
};

export type AdminStatsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; stats: EventStatistics };

const list = (value: string | null) => (value ? value.split(",") : []);

export function filterFromParams(params: URLSearchParams): StatsFilter {
  const origins = params.has("excludeOrigins")
    ? list(params.get("excludeOrigins"))
    : ["blocker"];
  return {
    excludeLocations: list(params.get("excludeLocations")),
    excludeHosts: list(params.get("excludeHosts")),
    excludeOrigins: SESSION_ORIGINS.filter((o) => origins.includes(o)),
  };
}

/** The address parameters for a filter; null removes one, since blockers alone is the default. */
export function filterToParams(filter: StatsFilter) {
  const isDefault =
    filter.excludeOrigins.length === 1 &&
    filter.excludeOrigins[0] === "blocker";
  return {
    excludeLocations: filter.excludeLocations.join(",") || null,
    excludeHosts: filter.excludeHosts.join(",") || null,
    excludeOrigins: isDefault ? null : filter.excludeOrigins.join(","),
  };
}

function filterQuery(filter: StatsFilter) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filterToParams(filter)))
    if (value !== null) query.set(key, value);
  return query.toString().replaceAll("%2C", ",");
}

export function statsDownloadUrl(
  eventId: string,
  file: string,
  filter: StatsFilter
) {
  const query = filterQuery(filter);
  return `/api/v1/admin/events/${eventId}/${file}${query ? `?${query}` : ""}`;
}

export function createAdminStatsQuery({
  api,
  eventId,
  filter,
}: {
  api: ApiClient;
  eventId: string;
  filter: StatsFilter;
}) {
  const state = createObservable<AdminStatsState>({ status: "loading" });
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const params = filterToParams(filter);
      try {
        const { data, error, response } = await api.GET(
          "/api/v1/admin/events/{id}/stats",
          {
            params: {
              path: { id: eventId },
              query: Object.fromEntries(
                Object.entries(params).filter(([, v]) => v !== null)
              ),
            },
          }
        );
        state.set(
          data
            ? { status: "ready", stats: data }
            : { status: "error", code: problemCode(error, response.status) }
        );
      } catch {
        state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
