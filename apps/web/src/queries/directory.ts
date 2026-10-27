import type { ApiClient } from "@schellingboard/api-client";
import type { attendeeViewSchema } from "@schellingboard/contracts/guest";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

type AttendeeView = (typeof attendeeViewSchema)["_output"];

export type DirectoryEntry = Omit<AttendeeView, "profileUpdatedAt"> & {
  profileUpdatedAt: Date | null;
};

export type DirectoryQuery = ReturnType<typeof createDirectoryQuery>;

export type DirectoryState = {
  status: "idle" | "loading" | "ready" | "error";
  entries: DirectoryEntry[];
  code?: string;
};

/** Everyone on the site: the directory is not scoped to an event (ADR 0016). */
export function createDirectoryQuery({ api }: { api: ApiClient }) {
  const state = createObservable<DirectoryState>({
    status: "idle",
    entries: [],
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
      const { entries } = state.get();
      state.set({ status: "loading", entries });
      const mine = ++latest;
      const current = () => !destroyed && mine === latest;
      const next: DirectoryEntry[] = [];
      try {
        let cursor: string | undefined;
        do {
          const { data, error, response } = await api.GET("/api/v1/attendees", {
            params: { query: { limit: 1000, cursor } },
          });
          if (!current()) return;
          if (!data) {
            state.set({
              status: "error",
              code: problemCode(error, response.status),
              entries,
            });
            return;
          }
          for (const item of data.items)
            next.push({
              ...item,
              profileUpdatedAt: item.profileUpdatedAt
                ? new Date(item.profileUpdatedAt)
                : null,
            });
          cursor = data.nextCursor ?? undefined;
        } while (cursor);
        state.set({ status: "ready", entries: next });
      } catch {
        if (current())
          state.set({ status: "error", code: "network.unreachable", entries });
      }
    },
  };
}
