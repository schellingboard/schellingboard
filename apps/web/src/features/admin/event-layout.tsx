import type { ReactNode } from "react";
import type { AdminEvent } from "../../queries/admin-events";
import { BackLink } from "../../ui/back-link";
import { cx } from "../../ui/cx";

const SECTIONS = [
  { path: "", label: "Config" },
  { path: "/guests", label: "Guests" },
  { path: "/locations", label: "Locations" },
  { path: "/proposals", label: "Proposals" },
  { path: "/sessions", label: "Sessions" },
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
      aria-label="Event sections"
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
            {label}
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
        Could not load the event.
      </p>
    );
  if (status === "loading" || !event)
    return <p className="text-sm">Loading…</p>;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <BackLink href="/admin/events">Events</BackLink>
      </div>
      <h1 className="text-2xl font-bold text-fg">{event.name}</h1>
      <EventTabs eventId={event.id} currentPath={currentPath} />
      {children}
    </div>
  );
}
