import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

/** What the standings query knows about a proposal that the replica does not. */
export type Standing = {
  tally: { interested: number; maybe: number } | null;
  total: number | null;
};

export type StandingsQuery = ReturnType<typeof createStandingsQuery>;

export type StandingsState = {
  status: "idle" | "loading" | "ready" | "error";
  standings: ReadonlyMap<string, Standing>;
  code?: string;
};

/**
 * The counts the replica does not hold (ADR 0016): the vote count while voting
 * and the tally from the scheduling phase on.
 */
export function createStandingsQuery({
  api,
  eventId,
}: {
  api: ApiClient;
  eventId: string;
}) {
  const state = createObservable<StandingsState>({
    status: "idle",
    standings: new Map(),
  });
  let latest = 0;
  let destroyed = false;
  return {
    get: state.get,
    subscribe: state.subscribe,
    destroy() {
      destroyed = true;
    },
    async refresh() {
      const { standings } = state.get();
      state.set({ status: "loading", standings });
      const mine = ++latest;
      const current = () => !destroyed && mine === latest;
      const next = new Map<string, Standing>();
      try {
        let cursor: string | undefined;
        do {
          const { data, error, response } = await api.GET("/api/v1/proposals", {
            params: { query: { eventId, limit: 1000, cursor } },
          });
          if (!current()) return;
          if (!data) {
            state.set({
              status: "error",
              code: problemCode(error, response.status),
              standings,
            });
            return;
          }
          for (const p of data.items)
            next.set(p.id, {
              tally: p.tally,
              total: p.votesCount,
            });
          cursor = data.nextCursor ?? undefined;
        } while (cursor);
        state.set({ status: "ready", standings: next });
      } catch {
        if (current())
          state.set({
            status: "error",
            code: "network.unreachable",
            standings,
          });
      }
    },
  };
}
