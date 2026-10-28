import type { ApiClient } from "@schellingboard/api-client";
import type { meetingCandidatesSchema } from "@schellingboard/contracts/meeting";
import { createObservable } from "./store";

export type MeetingCandidates = (typeof meetingCandidatesSchema)["_output"];
export type MeetingCandidate = MeetingCandidates["candidates"][number];

export type MeetingCandidatesState = {
  /** "gone": not a slot this viewer can book at; "error": no answer. */
  status: "loading" | "ready" | "gone" | "error";
  found: MeetingCandidates | null;
};

export type MeetingCandidatesQuery = ReturnType<
  typeof createMeetingCandidatesQuery
>;

export function createMeetingCandidatesQuery({
  api,
  eventId,
  slotStart,
}: {
  api: ApiClient;
  eventId: string;
  slotStart: string;
}) {
  const state = createObservable<MeetingCandidatesState>({
    status: "loading",
    found: null,
  });
  let latest = 0;
  let destroyed = false;
  return {
    eventId,
    slotStart,
    get: state.get,
    subscribe: state.subscribe,
    destroy() {
      destroyed = true;
    },
    async load(slotCount: number) {
      const mine = ++latest;
      const current = () => !destroyed && mine === latest;
      state.set({ ...state.get(), status: "loading" });
      try {
        const { data, response } = await api.GET("/api/v1/meeting-candidates", {
          params: { query: { eventId, slotStart, slotCount } },
        });
        if (!current()) return;
        state.set(
          data
            ? { status: "ready", found: data }
            : {
                status: response.status === 404 ? "gone" : "error",
                found: null,
              }
        );
      } catch {
        if (current()) state.set({ status: "error", found: null });
      }
    },
  };
}
