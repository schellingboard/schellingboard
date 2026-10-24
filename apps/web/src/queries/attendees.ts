import type { ApiClient } from "@schellingboard/api-client";
import type { rsvpViewSchema } from "@schellingboard/contracts/rsvp";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

type Rsvp = (typeof rsvpViewSchema)["_output"];

export type AttendeesQuery = ReturnType<typeof createAttendeesQuery>;

export type AttendeesState =
  | { status: "idle" | "loading" | "ready"; rsvps: Rsvp[] }
  | { status: "error"; code: string; rsvps: Rsvp[] };

/** Who RSVPed to a session; the replica only holds the viewer's own RSVPs and the counts. */
export function createAttendeesQuery({
  api,
  sessionId,
}: {
  api: ApiClient;
  sessionId: string;
}) {
  const state = createObservable<AttendeesState>({
    status: "idle",
    rsvps: [],
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
      const { rsvps } = state.get();
      state.set({ status: "loading", rsvps });
      const mine = ++latest;
      const current = () => !destroyed && mine === latest;
      try {
        const { data, error, response } = await api.GET(
          "/api/v1/sessions/{id}/rsvps",
          { params: { path: { id: sessionId } } }
        );
        if (!current()) return;
        state.set(
          data
            ? { status: "ready", rsvps: data.rsvps }
            : {
                status: "error",
                code: problemCode(error, response.status),
                rsvps,
              }
        );
      } catch {
        if (current())
          state.set({ status: "error", code: "network.unreachable", rsvps });
      }
    },
  };
}

export function attendeeGuests<G extends { id: string }>(
  rsvps: { guestId: string }[],
  guests: G[]
): G[] {
  const byId = new Map(guests.map((g) => [g.id, g]));
  return rsvps.flatMap((r) => byId.get(r.guestId) ?? []);
}
