import { useState, type ReactNode } from "react";
import type { Event } from "@schellingboard/domain/event";
import { hasPhases } from "@schellingboard/domain/phase";
import { formatEventDates } from "@schellingboard/domain/time";
import { Dialog } from "../ui/dialog";
import {
  CalendarIcon,
  ClockIcon,
  InformationCircleIcon,
  ProposalsIcon,
  QueueIcon,
  TableIcon,
} from "../ui/icons";
import { cx } from "../ui/cx";
import { Markdown } from "../ui/markdown";
import { scrollNowLineIntoView } from "./now-line";

const ITEM_CLASS =
  "flex items-center gap-1 rounded-md px-1 py-1.5 text-xs text-fg-subtle hover:text-brand-fg focus:outline-none focus:ring-2 focus:ring-brand-accent sm:text-sm";

export type ScheduleView = "grid" | "agenda";

// Links to the retired Text and RSVP'd views (?view=text, ?view=rsvp) land on the grid.
export const scheduleView = (params: Pick<URLSearchParams, "get">) =>
  params.get("view") === "agenda" ? "agenda" : "grid";

const VIEWS = [
  { name: "grid", label: "Grid", icon: TableIcon },
  { name: "agenda", label: "Agenda", icon: QueueIcon },
] as const;

/**
 * Slim header for both schedule views: the Grid/Agenda toggle, "Now" (which
 * jumps either view to the current time), the event's details and, for an
 * event with phases, a link to its proposals. The event name is left out: the
 * site header already shows it.
 */
export function ScheduleToolbar({
  event,
  view,
  onViewChange,
  showJumpToNow,
  proposalsHref,
  sync,
}: {
  event: Event;
  view: ScheduleView;
  onViewChange: (view: ScheduleView) => void;
  /** Whether to offer "Now": only while the view has a line to jump to. */
  showJumpToNow: boolean;
  proposalsHref: string;
  sync: ReactNode;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    // The outer div spans the (possibly horizontally overflowing) grid width;
    // the inner one sticks the controls to the visible area, as the fold bars do.
    <div className="w-full border-b border-line-subtle bg-surface">
      <div className="sticky left-0 flex max-w-[100dvw] flex-wrap items-center gap-x-4 gap-y-1 px-2 py-1.5 sm:px-3">
        <div
          role="group"
          aria-label="Schedule view"
          className="flex flex-wrap items-center gap-2"
        >
          {VIEWS.map((v) => (
            <button
              key={v.name}
              type="button"
              aria-pressed={view === v.name}
              className={cx(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-accent sm:text-sm",
                view === v.name
                  ? "bg-brand text-on-brand"
                  : "text-fg-subtle ring-1 ring-inset ring-line hover:bg-surface-sunken"
              )}
              onClick={() => view !== v.name && onViewChange(v.name)}
            >
              <v.icon className="h-4 w-4 stroke-2" />
              {v.label}
            </button>
          ))}
        </div>
        <span className="hidden h-5 w-px bg-line-subtle sm:block" aria-hidden />
        <div className="flex items-center gap-x-4 gap-y-1">
          {showJumpToNow && (
            <button
              type="button"
              onClick={() => scrollNowLineIntoView()}
              title="Jump to the current time"
              className={ITEM_CLASS}
            >
              <ClockIcon className="h-4 w-4 stroke-2" />
              Now
            </button>
          )}
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className={ITEM_CLASS}
          >
            <InformationCircleIcon className="h-4 w-4 stroke-2" />
            Event details
          </button>
          {hasPhases(event) && (
            <a href={proposalsHref} className={ITEM_CLASS}>
              <ProposalsIcon className="h-4 w-4 stroke-2" />
              Proposals
            </a>
          )}
        </div>
        {sync}
      </div>
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={event.name}
      >
        <EventDetails event={event} />
      </Dialog>
    </div>
  );
}

function EventDetails({ event }: { event: Event }) {
  const dates = formatEventDates(event);
  return (
    <div className="max-h-[70dvh] overflow-y-auto">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-fg-subtle">
        <span className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4 stroke-2" />
          <span>
            {dates && `${dates} · `}
            {event.timezone}
          </span>
        </span>
        {event.website && (
          <a className="hover:underline" href={event.website}>
            {event.website}
          </a>
        )}
      </div>
      <div className="mt-3 text-fg">
        <Markdown>{event.description}</Markdown>
      </div>
    </div>
  );
}
