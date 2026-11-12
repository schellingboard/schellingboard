import { useEffect, useState, useSyncExternalStore } from "react";
import { formatRelativeTime } from "@schellingboard/domain/relative-time";
import type {
  NotificationAction,
  NotificationItem,
  NotificationsQuery,
} from "../../queries/notifications";
import { Button } from "../../ui/button";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { CheckIcon } from "../../ui/icons";
import { pageOf, requestedPage, type OnParams } from "../../ui/list-paging";
import { usePaging } from "../../ui/use-paging";

/** The signed-in guest's notifications: tick rows to mark or delete them, click one to open it. */
export function NotificationsScreen({
  query,
  now,
  params,
  onParams,
  onOpen,
  onUnreadChange,
}: {
  query: NotificationsQuery;
  now: Date;
  params: URLSearchParams;
  onParams: OnParams;
  /** Where a notification leads, once it is marked read. */
  onOpen: (url: string) => void;
  onUnreadChange: (count: number) => void;
}) {
  const state = useSyncExternalStore(query.subscribe, query.get);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedAt, setFailedAt] = useState<number | null>(null);
  const unread = state.status === "ready" ? state.unreadCount : undefined;
  const more = state.status === "ready" && state.hasMore;
  const items = state.status === "ready" ? state.items : [];
  const loaded = items.length;
  const pageSize = pageOf([], params).pageSize;
  const wanted =
    pageSize === "all" ? Infinity : requestedPage(params) * pageSize;
  const waiting = more && loaded < wanted && failedAt !== wanted;
  const { visible, pager, top } = usePaging<NotificationItem, HTMLDivElement>(
    items,
    params,
    onParams,
    { more, disabled: waiting }
  );

  useEffect(() => {
    if (!waiting) return;
    let stale = false;
    void query.loadMore().then((result) => {
      if (!stale && !result.ok) {
        setFailedAt(wanted);
        setError(result.message);
      }
    });
    return () => {
      stale = true;
    };
  }, [waiting, loaded, wanted, query]);

  useEffect(() => {
    if (unread !== undefined) onUnreadChange(unread);
  }, [unread, onUnreadChange]);

  if (state.status === "loading")
    return (
      <p role="status" className="px-4 text-fg-muted">
        Loading…
      </p>
    );
  if (state.status === "error")
    return (
      <p role="alert" className="px-4 text-danger-fg">
        Could not load your notifications. Reload the page to try again.
      </p>
    );

  const chosen = visible.filter((i) => selected.has(i.id)).map((i) => i.id);
  const allSelected = visible.length > 0 && chosen.length === visible.length;
  const someSelected = chosen.length > 0;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const run = async (act: () => Promise<NotificationAction>) => {
    setBusy(true);
    setError(null);
    const result = await act();
    setBusy(false);
    if (!result.ok) setError(result.message);
    return result;
  };

  const act = async (
    call: (ids: string[]) => Promise<NotificationAction>,
    ids: string[]
  ) => {
    const result = await run(() => call(ids));
    // The ticks were for this action: leaving them would let the next click
    // act again on rows already dealt with.
    if (result.ok) setSelected(new Set());
  };

  const open = async (id: string) => {
    const result = await run(() => query.open(id));
    if (result.ok && result.url) onOpen(result.url);
  };

  return (
    <div
      ref={top}
      className="mx-auto flex max-w-2xl flex-col gap-4 px-4 sm:px-0"
    >
      <h1 className="text-2xl font-bold">Notifications</h1>

      {items.length === 0 ? (
        <p className="text-fg-muted">
          Nothing yet. When someone comments on your session or changes
          something you have RSVP&apos;d to, it will show up here.
        </p>
      ) : (
        <>
          <div
            role="group"
            aria-label="Notification actions"
            className="flex flex-wrap items-center gap-3"
          >
            <label className="flex items-center gap-2 text-sm text-fg-muted">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected && !allSelected;
                }}
                onChange={() =>
                  setSelected(
                    allSelected ? new Set() : new Set(visible.map((i) => i.id))
                  )
                }
                className="h-4 w-4 cursor-pointer"
              />
              Select page
            </label>
            <div className="ml-auto flex gap-2">
              <Button
                variant="quiet"
                className="border border-line"
                disabled={!someSelected || busy}
                onClick={() => void act(query.markRead, chosen)}
              >
                Mark as read
              </Button>
              <Button
                variant="danger"
                disabled={!someSelected || busy}
                onClick={() => setConfirming(true)}
              >
                Delete
              </Button>
            </div>
          </div>

          {waiting ? (
            <p role="status" className="text-fg-muted">
              Loading…
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {visible.map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  now={now}
                  ticked={selected.has(item.id)}
                  busy={busy}
                  onTick={() => toggle(item.id)}
                  onOpen={() => void open(item.id)}
                  onMarkRead={() => void act(query.markRead, [item.id])}
                />
              ))}
            </ul>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger-fg">
          {error}
        </p>
      )}

      {failedAt !== null && failedAt === wanted && (
        <Button
          variant="quiet"
          className="self-start border border-line"
          onClick={() => {
            setFailedAt(null);
            setError(null);
          }}
        >
          Try again
        </Button>
      )}

      {pager}

      <ConfirmDialog
        open={confirming}
        title="Delete notifications"
        message={
          chosen.length === 1
            ? "Delete this notification? This cannot be undone."
            : `Delete these ${chosen.length} notifications? This cannot be undone.`
        }
        confirmLabel="Delete"
        destructive
        cancelLabel="Cancel"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          void act(query.remove, chosen);
        }}
      />
    </div>
  );
}

function Row({
  item,
  now,
  ticked,
  busy,
  onTick,
  onOpen,
  onMarkRead,
}: {
  item: NotificationItem;
  now: Date;
  ticked: boolean;
  busy: boolean;
  onTick: () => void;
  onOpen: () => void;
  onMarkRead: () => void;
}) {
  const read = item.readAt !== null;
  return (
    <li
      className={
        read
          ? "rounded-md border border-line bg-surface-raised"
          : "rounded-md border border-brand-accent bg-brand-tint"
      }
    >
      <div className="flex items-center gap-3 p-3">
        {/* mt-1 centres the box on the first line of a notification that wraps. */}
        <input
          type="checkbox"
          checked={ticked}
          aria-label={`Select ${item.text}`}
          onChange={onTick}
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer self-start"
        />
        <button
          type="button"
          disabled={busy}
          onClick={onOpen}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <span className={read ? "block text-fg-subtle" : "block font-medium"}>
            {item.text}
          </span>
          <span className="block text-sm text-fg-muted">
            {formatRelativeTime(new Date(item.createdAt), now)}
          </span>
        </button>
        {!read && (
          <button
            type="button"
            title="Mark as read"
            aria-label="Mark as read"
            disabled={busy}
            onClick={onMarkRead}
            className="shrink-0 cursor-pointer rounded-md p-2 text-fg-subtle hover:bg-surface-muted disabled:opacity-50"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </li>
  );
}
