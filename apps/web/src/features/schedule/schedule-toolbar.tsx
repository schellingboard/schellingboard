import { i18n } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { Event } from "@schellingboard/domain/event";
import { hasPhases } from "@schellingboard/domain/phase";
import type { ReactNode } from "react";

import { cx } from "../../ui/cx";
import {
  ClockIcon,
  InformationCircleIcon,
  ProposalsIcon,
  QueueIcon,
  TableIcon,
} from "../../ui/icons";
import { PhaseBar } from "../../ui/phase-bar";
import { Tooltip } from "../../ui/tooltip";
import { scrollNowLineIntoView } from "./now-line";

const LOCAL_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const ITEM_CLASS =
  "flex items-center gap-1 rounded-md px-1 py-1.5 text-xs text-fg-subtle hover:text-brand-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent sm:text-sm";

export type ScheduleView = "grid" | "agenda";
const VIEW_GRID = "grid";
const VIEW_AGENDA = "agenda";

// Links to the retired Text and RSVP'd views (?view=text, ?view=rsvp) land on the grid.
export const scheduleView = (params: Pick<URLSearchParams, "get">) =>
  params.get("view") === VIEW_AGENDA ? VIEW_AGENDA : VIEW_GRID;

const VIEWS = [
  {
    name: VIEW_GRID,
    label: msg({
      message: "Grid",
      comment: "Name of the schedule view that shows rooms as columns",
    }),
    icon: TableIcon,
  },
  { name: VIEW_AGENDA, label: msg`Agenda`, icon: QueueIcon },
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
  onOpenDetails,
  showJumpToNow,
  proposalsHref,
  now,
  sync,
}: {
  event: Event;
  view: ScheduleView;
  onViewChange: (view: ScheduleView) => void;
  onOpenDetails: () => void;
  /** Whether to offer "Now": only while the view has a line to jump to. */
  showJumpToNow: boolean;
  proposalsHref: string;
  now: Date;
  sync: ReactNode;
}) {
  return (
    // The outer div spans the (possibly horizontally overflowing) grid width;
    // the inner one sticks the controls to the visible area, as the fold bars do.
    <div className="w-full border-b border-line-subtle bg-surface">
      <div className="sticky left-0 max-w-[100dvw]">
        <PhaseBar event={event} now={now} localZone={LOCAL_ZONE} />
      </div>
      <div className="sticky left-0 flex max-w-[100dvw] flex-wrap items-center gap-x-4 gap-y-1 px-2 py-1.5 sm:px-3">
        <div
          role="group"
          aria-label={t`Schedule view`}
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
              {i18n._(v.label)}
            </button>
          ))}
        </div>
        <span className="hidden h-5 w-px bg-line-subtle sm:block" aria-hidden />
        <div className="flex items-center gap-x-4 gap-y-1">
          {showJumpToNow && (
            <Tooltip content={t`Jump to the current time`}>
              <button
                type="button"
                onClick={() => scrollNowLineIntoView()}
                className={ITEM_CLASS}
              >
                <ClockIcon className="h-4 w-4 stroke-2" />
                <Trans comment="Button: jump to the current time">Now</Trans>
              </button>
            </Tooltip>
          )}
          <button type="button" onClick={onOpenDetails} className={ITEM_CLASS}>
            <InformationCircleIcon className="h-4 w-4 stroke-2" />
            <Trans>Event details</Trans>
          </button>
          {hasPhases(event) && (
            <a href={proposalsHref} className={ITEM_CLASS}>
              <ProposalsIcon className="h-4 w-4 stroke-2" />
              <Trans>Proposals</Trans>
            </a>
          )}
        </div>
        {sync}
      </div>
    </div>
  );
}
