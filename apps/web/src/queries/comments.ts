import type { ApiClient } from "@schellingboard/api-client";
import type { CommentSubject, CommentView } from "../commands/comment";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

export type CommentsState = {
  status: "idle" | "loading" | "ready" | "error";
  items: CommentView[];
  hasMore: boolean;
  code?: string;
};

const DEFAULT_PAGE_SIZE = 50;

/** A subject's comments, oldest first, one page at a time. */
export function createCommentsQuery({
  api,
  subject,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  api: ApiClient;
  subject: CommentSubject;
  pageSize?: number;
}) {
  const state = createObservable<CommentsState>({
    status: "idle",
    items: [],
    hasMore: true,
  });
  let cursor: string | undefined;
  let destroyed = false;
  let inFlight: Promise<void> | undefined;

  const fetchPage = () => {
    const options = {
      params: {
        path: { id: subject.id },
        query: { limit: pageSize, cursor },
      },
    };
    switch (subject.kind) {
      case "session":
        return api.GET("/api/v1/sessions/{id}/comments", options);
      case "proposal":
        return api.GET("/api/v1/proposals/{id}/comments", options);
      case "profile":
        return api.GET("/api/v1/guests/{id}/comments", options);
    }
  };

  const merge = (items: CommentView[], more: CommentView[]) => {
    const seen = new Set(items.map((c) => c.id));
    return [...items, ...more.filter((c) => !seen.has(c.id))].sort(
      (a, b) => Date.parse(a.createdTime) - Date.parse(b.createdTime)
    );
  };

  async function load() {
    state.set({ ...state.get(), status: "loading" });
    const fail = (code: string) =>
      state.set({ ...state.get(), status: "error", code });
    try {
      const { data, error, response } = await fetchPage();
      if (destroyed) return;
      if (!data) return fail(problemCode(error, response.status));
      cursor = data.nextCursor ?? undefined;
      state.set({
        status: "ready",
        items: merge(state.get().items, data.items),
        hasMore: data.nextCursor !== null,
      });
    } catch {
      if (!destroyed) fail("network.unreachable");
    }
  }

  return {
    get: state.get,
    subscribe: state.subscribe,
    loadMore(): Promise<void> {
      if (inFlight) return inFlight;
      if (!state.get().hasMore) return Promise.resolve();
      inFlight = load().finally(() => (inFlight = undefined));
      return inFlight;
    },
    destroy() {
      destroyed = true;
    },
    add(comment: CommentView) {
      const current = state.get();
      state.set({ ...current, items: merge(current.items, [comment]) });
    },
  };
}
