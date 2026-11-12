import { i18n } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { ReactNode } from "react";

import type { AdminEvent } from "../../queries/admin-events";
import { BackLink } from "../../ui/back-link";
import { cx } from "../../ui/cx";

const SECTIONS = [
  {
    path: "",
    label: msg({
      message: "Config",
      context: "Event admin tab: the event settings",
    }),
  },
  { path: "/guests", label: msg`Guests` },
  { path: "/locations", label: msg`Locations` },
  { path: "/proposals", label: msg`Proposals` },
  { path: "/sessions", label: msg`Sessions` },
];

function EventTabs({
  eventId,
  currentPath,
}: {
  eventId: string;
  currentPath: string;
}) {
  const base = `/admin/events/${eventId}`;
  return (
    <nav
      aria-label={t`Event sections`}
      className="flex gap-1 overflow-x-auto border-b border-line-subtle"
    >
      {SECTIONS.map(({ path, label }) => {
        const href = base + path;
        const active = path
          ? currentPath.startsWith(href)
          : currentPath === base;
        return (
          <a
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-line-strong text-fg"
                : "border-transparent text-fg-subtle hover:border-line hover:text-fg-muted"
            )}
          >
            {i18n._(label)}
          </a>
        );
      })}
    </nav>
  );
}

export function AdminEventLayout({
  status,
  event,
  currentPath,
  children,
}: {
  status: "loading" | "ready" | "error";
  event?: AdminEvent;
  currentPath: string;
  children: ReactNode;
}) {
  if (status === "error" || (status === "ready" && !event))
    return (
      <p role="alert" className="text-sm text-danger-fg">
        <Trans>Could not load the event.</Trans>
      </p>
    );
  if (status === "loading" || !event)
    return (
      <p className="text-sm">
        <Trans>Loading…</Trans>
      </p>
    );

  return (
    <div className="w-full space-y-6">
      <div>
        <BackLink href="/admin/events">
          <Trans>Events</Trans>
        </BackLink>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-fg">{event.name}</h1>
        <a
          href={`/admin/statistics/${event.id}`}
          className="text-sm font-medium text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          <Trans>Statistics</Trans>
        </a>
      </div>
      <EventTabs eventId={event.id} currentPath={currentPath} />
      {children}
    </div>
  );
}
