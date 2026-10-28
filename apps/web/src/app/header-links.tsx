import { useEffect, useState } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import { BellIcon, UserGroupIcon } from "../ui/icons";

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
  const [unread, setUnread] = useState<number>();
  useEffect(() => {
    if (!signedIn) return;
    let stale = false;
    api
      .GET("/api/v1/me/notifications")
      .then(({ data }) => {
        if (!stale && data) setUnread(data.unreadCount);
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api, signedIn]);

  return (
    <>
      <a href="/guests" className={link}>
        <UserGroupIcon className="h-5 w-5" />
        <span className="sr-only sm:not-sr-only">Attendees</span>
      </a>
      {signedIn && unread !== undefined && (
        <a
          href="/legacy/notifications"
          aria-label={
            unread > 0 ? `Notifications (${unread} unread)` : "Notifications"
          }
          className="relative flex items-center rounded-md p-2 text-fg-subtle hover:bg-surface-muted"
        >
          <BellIcon className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-brand-accent px-1 text-center text-xs font-medium leading-4 text-fg-inverse">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </a>
      )}
    </>
  );
}
