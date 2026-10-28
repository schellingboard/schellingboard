import type { ApiClient } from "@schellingboard/api-client";
import type { profileActivitySchema } from "@schellingboard/contracts/guest";
import type { meetingOptionsSchema } from "@schellingboard/contracts/meeting";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

type Activity = (typeof profileActivitySchema)["_output"];
export type ProfileMeetingOption =
  (typeof meetingOptionsSchema)["_output"]["options"][number];

export type ProfileActivityQuery = ReturnType<
  typeof createProfileActivityQuery
>;

export type ProfileActivityState = {
  status: "idle" | "loading" | "ready" | "error";
  hosting: Activity["hosting"];
  proposals: Activity["proposals"];
  /** What the viewer may book with this guest, per shared event. */
  meetingOptions: ProfileMeetingOption[];
  code?: string;
};

const EMPTY = { hosting: [], proposals: [], meetingOptions: [] };

/**
 * What a profile shows beyond the directory entry. It spans every event, so
 * the per-event replica cannot hold it (ADR 0016).
 */
export function createProfileActivityQuery({
  api,
  guestId,
}: {
  api: ApiClient;
  guestId: string;
}) {
  const state = createObservable<ProfileActivityState>({
    status: "idle",
    ...EMPTY,
  });
  let latest = 0;
  let destroyed = false;
  const path = { params: { path: { id: guestId } } };
  return {
    get: state.get,
    subscribe: state.subscribe,
    destroy() {
      destroyed = true;
    },
    async refresh() {
      state.set({ ...state.get(), status: "loading" });
      const mine = ++latest;
      const current = () => !destroyed && mine === latest;
      try {
        const [activity, options] = await Promise.all([
          api.GET("/api/v1/guests/{id}/activity", path),
          api.GET("/api/v1/guests/{id}/meeting-options", path),
        ]);
        if (!current()) return;
        if (!activity.data) {
          state.set({
            ...state.get(),
            status: "error",
            code: problemCode(activity.error, activity.response.status),
          });
          return;
        }
        state.set({
          status: "ready",
          hosting: activity.data.hosting,
          proposals: activity.data.proposals,
          meetingOptions: options.data?.options ?? [],
        });
      } catch {
        if (current())
          state.set({
            ...state.get(),
            status: "error",
            code: "network.unreachable",
          });
      }
    },
  };
}
