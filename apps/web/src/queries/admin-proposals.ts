import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type AdminProposal = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  hosts: { id: string; name: string }[];
  /** Known in the voting phase only. */
  votesCount: number | null;
  sessionCount: number;
  version: number;
};

export type AdminProposalsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; proposals: AdminProposal[] };

export type AdminProposalsQuery = ReturnType<typeof createAdminProposalsQuery>;

/** An event's proposals; `load` again after a change. */
export function createAdminProposalsQuery({
  api,
  eventId,
}: {
  api: ApiClient;
  eventId: string;
}) {
  const state = createObservable<AdminProposalsState>({ status: "loading" });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const proposals: AdminProposal[] = [];
        let cursor: string | undefined;
        do {
          const { data, error, response } = await api.GET("/api/v1/proposals", {
            params: { query: { eventId, limit: 1000, cursor } },
          });
          if (mine !== latest) return;
          if (!data) {
            state.set({
              status: "error",
              code: problemCode(error, response.status),
            });
            return;
          }
          for (const p of data.items)
            proposals.push({
              id: p.id,
              title: p.title,
              description: p.description ?? "",
              durationMinutes: p.durationMinutes,
              hosts: p.hosts.map((h) => ({ id: h.id, name: h.name })),
              votesCount: p.votesCount,
              sessionCount: p.sessionIds.length,
              version: p.version,
            });
          cursor = data.nextCursor ?? undefined;
        } while (cursor);
        state.set({ status: "ready", proposals });
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
