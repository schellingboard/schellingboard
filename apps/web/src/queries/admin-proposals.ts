import type { ApiClient } from "@schellingboard/api-client";
import { createPagedQuery, type PagedState } from "./paged-query";

export type AdminProposal = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  hosts: { id: string; name: string }[];
  votesCount: number;
  sessionCount: number;
  version: number;
};

export type AdminProposalsState = PagedState<"proposals", AdminProposal>;

export type AdminProposalsQuery = ReturnType<typeof createAdminProposalsQuery>;

/** An event's proposals; `load` again after a change. */
export function createAdminProposalsQuery({
  api,
  eventId,
}: {
  api: ApiClient;
  eventId: string;
}) {
  return createPagedQuery({
    key: "proposals",
    fetchPage: (cursor) =>
      api.GET("/api/v1/proposals", {
        params: { query: { eventId, limit: 1000, cursor } },
      }),
    map: (p): AdminProposal => ({
      id: p.id,
      title: p.title,
      description: p.description ?? "",
      durationMinutes: p.durationMinutes,
      hosts: p.hosts.map((h) => ({ id: h.id, name: h.name })),
      votesCount: p.votesCount ?? 0,
      sessionCount: p.sessionIds.length,
      version: p.version,
    }),
  });
}
