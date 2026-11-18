import { useEffect } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import { BellIcon, UserGroupIcon } from "../ui/icons";
import { useUnread } from "./unread-count";

// The event feed carries schedule changes only. Slow, because open-name
// visitors behind one venue address share one rate-limit bucket.
export const UNREAD_POLL_MS = 120_000;

const link =
  "flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-fg-subtle hover:bg-surface-muted sm:px-3";

/** The attendee list and, for someone with a name, their notifications. */
export function HeaderLinks({
  api,
  signedIn,
}: {
  api: ApiClient;
  signedIn: boolean;
}) {
  const [unread, setUnread] = useUnread();
  useEffect(() => {
    if (!signedIn) return;
    let stale = false;
    const refresh = () =>
      api
        .GET("/api/v1/me/notifications")
        .then(({ data }) => {
          if (!stale && data) setUnread(data.unreadCount);
        })
        .catch(() => {});
    const refreshIfVisible = () => {
      if (document.visibilityState !== "hidden") void refresh();
    };
    void refresh();
    const timer = setInterval(refreshIfVisible, UNREAD_POLL_MS);
    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    return () => {
      stale = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
    };
  }, [api, signedIn, setUnread]);

  return (
    <>
      <a href="/guests" className={link}>
        <UserGroupIcon className="h-5 w-5" />
        <span className="sr-only sm:not-sr-only">Attendees</span>
      </a>
      {signedIn && (
        <a
          href="/notifications"
          aria-label={
            unread ? `Notifications (${unread} unread)` : "Notifications"
          }
          className="relative flex items-center rounded-md p-2 text-fg-subtle hover:bg-surface-muted"
        >
          <BellIcon className="h-5 w-5" />
          {!!unread && (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-brand-accent px-1 text-center text-xs font-medium leading-4 text-fg-inverse">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </a>
      )}
    </>
  );
}
