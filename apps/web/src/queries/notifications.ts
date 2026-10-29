import type { myNotificationsSchema } from "@schellingboard/contracts/notification";
import { newKey } from "../commands/keys";
import { awaitMutation } from "../commands/mutation";
import type { NotificationCalls } from "../commands/notifications";
import { problemCode } from "../commands/problem";
import { createObservable } from "./store";

type Page = (typeof myNotificationsSchema)["_output"];
export type NotificationItem = Page["items"][number];

export const PAGE_SIZE = 20;

export type NotificationsState =
  | { status: "loading" }
  /** `code` says why: a refusal such as "guest.unselected", or a status. */
  | { status: "error"; code: string }
  | {
      status: "ready";
      items: NotificationItem[];
      /** Across every page, not just the loaded ones. */
      unreadCount: number;
      hasMore: boolean;
    };

export type NotificationAction =
  { ok: true; url?: string } | { ok: false; message: string };

export type NotificationsQuery = ReturnType<typeof createNotificationsQuery>;

/** The caller's notifications, newest first, with the changes they make to them. */
export function createNotificationsQuery({
  calls,
}: {
  calls: NotificationCalls;
}) {
  const state = createObservable<NotificationsState>({ status: "loading" });
  let cursor: string | null = null;
  let latest = 0;
  let destroyed = false;

  const ready = () => {
    const current = state.get();
    return current.status === "ready" ? current : null;
  };

  const fail = (
    after: string | undefined,
    code: string
  ): NotificationAction => {
    // A failed "older" page must not take the loaded rows away.
    if (!after) state.set({ status: "error", code });
    return { ok: false, message: "Could not load your notifications." };
  };

  const fetchPage = async (after?: string): Promise<NotificationAction> => {
    const mine = ++latest;
    try {
      const { data, error, response } = await calls.list(PAGE_SIZE, after);
      if (destroyed || mine !== latest) return { ok: true };
      if (!data) return fail(after, problemCode(error, response.status));
      cursor = data.nextCursor;
      const before = after ? (ready()?.items ?? []) : [];
      state.set({
        status: "ready",
        items: [...before, ...data.items],
        unreadCount: data.unreadCount,
        hasMore: data.nextCursor !== null,
      });
      return { ok: true };
    } catch {
      return destroyed || mine !== latest
        ? { ok: true }
        : fail(after, "unreachable");
    }
  };

  const change = async (
    call: (key: string) => ReturnType<NotificationCalls["markRead"]>,
    apply: (current: NonNullable<ReturnType<typeof ready>>) => void
  ): Promise<NotificationAction> => {
    const result = await awaitMutation(call, newKey());
    if (!result.ok) return { ok: false, message: result.message };
    const current = ready();
    if (current) apply(current);
    return { ok: true };
  };

  const unreadAmong = (items: NotificationItem[], ids: string[]) =>
    items.filter((i) => ids.includes(i.id) && i.readAt === null).length;

  return {
    get: state.get,
    subscribe: state.subscribe,
    destroy() {
      destroyed = true;
    },
    load: async () => void (await fetchPage()),
    loadMore: async (): Promise<NotificationAction> =>
      cursor ? fetchPage(cursor) : { ok: true },
    markRead: (ids: string[]) =>
      change(
        (key) => calls.markRead(ids, key),
        (current) =>
          state.set({
            ...current,
            items: current.items.map((i) =>
              ids.includes(i.id) && i.readAt === null
                ? { ...i, readAt: new Date().toISOString() }
                : i
            ),
            unreadCount: current.unreadCount - unreadAmong(current.items, ids),
          })
      ),
    remove: (ids: string[]) =>
      change(
        (key) => calls.remove(ids, key),
        (current) =>
          state.set({
            ...current,
            items: current.items.filter((i) => !ids.includes(i.id)),
            unreadCount: current.unreadCount - unreadAmong(current.items, ids),
          })
      ),
    /** Marks one read and says where it leads. */
    async open(id: string): Promise<NotificationAction> {
      const result = await awaitMutation(
        (key) => calls.open(id, key),
        newKey()
      );
      if (!result.ok || !result.data)
        return {
          ok: false,
          message: result.ok
            ? "Could not open this notification."
            : result.message,
        };
      const current = ready();
      if (current)
        state.set({
          ...current,
          items: current.items.map((i) => (i.id === id ? result.data! : i)),
          unreadCount: current.unreadCount - unreadAmong(current.items, [id]),
        });
      return { ok: true, url: result.data.url };
    },
  };
}
