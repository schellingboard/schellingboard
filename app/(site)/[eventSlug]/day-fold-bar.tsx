"use client";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { DateTime } from "luxon";
import type { DayWithSessions } from "../context";

// Collapsed/expandable header for a day that has already passed, or that has
// nothing a search or filter is looking for. In the grid view the label sticks
// to the left edge so it stays readable while the wide grid is scrolled
// horizontally.
export function DayFoldBar(props: {
  day: DayWithSessions;
  timezone: string;
  folded: boolean;
  onToggle: () => void;
  reason?: string;
}) {
  const { day, timezone, folded, onToggle, reason = "day has passed" } = props;
  const date = DateTime.fromJSDate(day.start).setZone(timezone);
  const Chevron = folded ? ChevronRightIcon : ChevronDownIcon;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="block w-full bg-surface-sunken hover:bg-surface-muted transition-colors border-b border-line-subtle text-left"
    >
      <span className="sticky left-0 inline-flex items-center gap-1.5 px-2 py-1.5 text-xs text-fg-subtle">
        <Chevron className="h-3.5 w-3.5 stroke-2" />
        <span className="font-medium">{date.toFormat("EEEE, MMMM d")}</span>
        <span>
          · {reason} · {folded ? "show" : "hide"}
        </span>
      </span>
    </button>
  );
}
