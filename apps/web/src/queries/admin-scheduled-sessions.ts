import type { ApiClient } from "@schellingboard/api-client";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type ScheduledSession = {
  title: string;
  startTime: string;
  endTime: string;
};

export type AdminScheduledSessionsState =
  | { status: "loading" }
  | { status: "error"; code: string }
  | { status: "ready"; sessions: ScheduledSession[] };

export type AdminScheduledSessionsQuery = ReturnType<
  typeof createAdminScheduledSessionsQuery
>;

/** The sessions with a time, which deleting a day would take with it. */
export function createAdminScheduledSessionsQuery({
  api,
  eventId,
}: {
  api: ApiClient;
  eventId: string;
}) {
  const state = createObservable<AdminScheduledSessionsState>({
    status: "loading",
  });
  let latest = 0;
  return {
    get: state.get,
    subscribe: state.subscribe,
    async load() {
      const mine = ++latest;
      try {
        const sessions: ScheduledSession[] = [];
        let cursor: string | undefined;
        do {
          const { data, error, response } = await api.GET("/api/v1/sessions", {
            params: { query: { eventId, cursor } },
          });
          if (mine !== latest) return;
          if (!data) {
            state.set({
              status: "error",
              code: problemCode(error, response.status),
            });
            return;
          }
          for (const s of data.items)
            if (s.startTime && s.endTime)
              sessions.push({
                title: s.title,
                startTime: s.startTime,
                endTime: s.endTime,
              });
          cursor = data.nextCursor ?? undefined;
        } while (cursor);
        state.set({ status: "ready", sessions });
      } catch {
        if (mine === latest)
          state.set({ status: "error", code: "unreachable" });
      }
    },
  };
}
