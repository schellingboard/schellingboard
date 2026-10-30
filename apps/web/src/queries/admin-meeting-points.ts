import type { ApiClient } from "@schellingboard/api-client";
import type { meetingPointSchema } from "@schellingboard/contracts/meeting";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type MeetingPoint = (typeof meetingPointSchema)["_output"];

export type AdminMeetingPointsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; points: MeetingPoint[] };

export type AdminMeetingPointsQuery = ReturnType<
  typeof createAdminMeetingPointsQuery
>;

/** An event's suggested meeting points; `load` again after a change. */
export function createAdminMeetingPointsQuery({
  api,
  id,
}: {
  api: ApiClient;
  id: string;
}) {
  const state = createObservable<AdminMeetingPointsState>({
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
          "/api/v1/admin/events/{id}/meeting-points",
          { params: { path: { id } } }
        );
        if (mine !== latest) return;
        state.set(
          data
            ? { status: "ready", points: data.meetingPoints }
            : { status: "error", code: problemCode(error, response.status) }
        );
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
