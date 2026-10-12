import { DateTime } from "luxon";
import { ChevronDownIcon, ChevronRightIcon } from "../ui/icons";

/**
 * Header for a day that has passed, or that has nothing a search is looking
 * for. The label sticks to the left edge so it stays readable while the wide
 * grid is scrolled sideways.
 */
export function DayFoldBar({
  day,
  timezone,
  folded,
  onToggle,
  reason = "day has passed",
}: {
  day: { start: Date };
  timezone: string;
  folded: boolean;
  onToggle: () => void;
  reason?: string;
}) {
  const date = DateTime.fromJSDate(day.start).setZone(timezone);
  const Chevron = folded ? ChevronRightIcon : ChevronDownIcon;
  return (
    <button
      type="button"
      aria-expanded={!folded}
      onClick={onToggle}
      className="block w-full border-b border-line-subtle bg-surface-sunken text-left transition-colors hover:bg-surface-muted"
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
