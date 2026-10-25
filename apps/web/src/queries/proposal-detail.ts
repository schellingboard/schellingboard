import type { ApiClient } from "@schellingboard/api-client";
import type { voteBreakdownSchema } from "@schellingboard/contracts/proposal";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type ProposalDetailQuery = ReturnType<typeof createProposalDetailQuery>;

export type VoteBreakdown = (typeof voteBreakdownSchema)["_output"];

export type ProposalDetailState = {
  status: "idle" | "loading" | "ready" | "error";
  /** From the scheduling phase on. */
  tally: { interested: number; maybe: number } | null;
  /** Only for the proposal's hosts, or anyone's when nobody hosts it. */
  breakdown: VoteBreakdown | null;
  code?: string;
};

/** What the replica does not hold of one proposal: its votes (ADR 0016). */
export function createProposalDetailQuery({
  api,
  proposalId,
}: {
  api: ApiClient;
  proposalId: string;
}) {
  const state = createObservable<ProposalDetailState>({
    status: "idle",
    tally: null,
    breakdown: null,
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
      const { tally, breakdown } = state.get();
      state.set({ status: "loading", tally, breakdown });
      const mine = ++latest;
      const current = () => !destroyed && mine === latest;
      try {
        const { data, error, response } = await api.GET(
          "/api/v1/proposals/{id}",
          { params: { path: { id: proposalId } } }
        );
        if (!current()) return;
        state.set(
          data
            ? { status: "ready", tally: data.tally, breakdown: data.breakdown }
            : {
                status: "error",
                code: problemCode(error, response.status),
                tally,
                breakdown,
              }
        );
      } catch {
        if (current())
          state.set({
            status: "error",
            code: "network.unreachable",
            tally,
            breakdown,
          });
      }
    },
  };
}
