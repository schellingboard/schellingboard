import { vi } from "vitest";
import type { CommentView } from "../../commands/comment";
import type { CommentsState } from "../../queries/comments";
import type { CommentsController } from "../../queries/comments-controller";
import { createObservable } from "../../queries/store";
import type { ScheduleActions } from "./context";

export const comment = (
  id: string,
  over: Partial<CommentView> = {}
): CommentView => ({
  id,
  parentId: null,
  body: `body of ${id}`,
  deleted: false,
  createdTime: "2026-06-02T10:00:00.000Z",
  editedTime: null,
  author: { id: "host", name: "HOST" },
  likes: [],
  ...over,
});

export function fakeComments(
  items: CommentView[] = [],
  state: Partial<CommentsState> = {}
): ReturnType<ScheduleActions["comments"]> & {
  state: ReturnType<typeof createObservable<CommentsState>>;
} {
  const store = createObservable<CommentsState>({
    status: "ready",
    items,
    hasMore: false,
    ...state,
  });
  const ok = () => Promise.resolve({ ok: true as const });
  const controller: CommentsController = {
    create: vi.fn(ok),
    edit: vi.fn(ok),
    remove: vi.fn(ok),
    setLiked: vi.fn(ok),
  };
  return {
    state: store,
    controller,
    query: {
      get: store.get,
      subscribe: store.subscribe,
      loadMore: vi.fn(() => Promise.resolve()),
      destroy: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
  };
}
