import { t } from "@lingui/core/macro";

import { BellIcon, UserGroupIcon } from "../ui/icons";
import { useUnread } from "./unread-count";

const link =
  "flex items-center gap-1 rounded-md px-2 py-2 text-sm font-medium text-fg-subtle hover:bg-surface-muted sm:px-3";

/** The attendee list and, for someone with a name, their notifications. */
export function HeaderLinks({ signedIn }: { signedIn: boolean }) {
  const [unread] = useUnread();

  return (
    <>
      <a href="/guests" className={link}>
        <UserGroupIcon className="h-5 w-5" />
        <span className="sr-only sm:not-sr-only">{t`Attendees`}</span>
      </a>
      {signedIn && (
        <a
          href="/notifications"
          aria-label={
            unread ? t`Notifications (${unread} unread)` : t`Notifications`
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
