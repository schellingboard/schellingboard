import type { ApiClient } from "@schellingboard/api-client";
import { createPagedQuery, type PagedState } from "./paged-query";

export type AdminGuest = {
  id: string;
  name: string;
  email: string;
  eventIds: string[];
  siteAdmin: boolean;
  hasPassword: boolean;
  version: number;
};

export type AdminGuestsState = PagedState<"guests", AdminGuest>;

export type AdminGuestsQuery = ReturnType<typeof createAdminGuestsQuery>;

/** Every guest with the events they belong to; `load` again after a change. */
export function createAdminGuestsQuery({ api }: { api: ApiClient }) {
  return createPagedQuery({
    key: "guests",
    fetchPage: (cursor) =>
      api.GET("/api/v1/admin/guests", { params: { query: { cursor } } }),
    map: (g): AdminGuest => ({
      id: g.id,
      name: g.name,
      email: g.email,
      eventIds: g.eventIds,
      siteAdmin: g.siteAdmin,
      hasPassword: g.hasPassword,
      version: g.version,
    }),
  });
}
