import { DateTime } from "luxon";
import type { SharedMoment } from "@schellingboard/domain/event";
import { useTimeFormat } from "../../app/time-format";
import { Tooltip } from "../../ui/tooltip";
import { useSchedule } from "./context";
import { GUTTER, gridBlockPx } from "./grid-layout";
import type { DayWithSessions } from "./model";

const STRIPES =
  "repeating-linear-gradient(135deg, color-mix(in srgb, var(--warning) 22%, transparent) 0 6px, transparent 6px 12px)";

/**
 * The bands of a day's shared moments, painted over the room columns. It takes
 * no clicks, so the slots beneath stay bookable; only the pill is interactive.
 */
export function MomentBands({
  day,
  column,
  row,
}: {
  day: DayWithSessions;
  column: number;
  row: number;
}) {
  const { slotIncrement, timezone } = useSchedule();
  const timeFormat = useTimeFormat();
  if (day.moments.length === 0) return null;
  const time = (at: Date) =>
    DateTime.fromJSDate(at).setZone(timezone).toFormat(timeFormat);
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{ gridColumn: `${column} / -1`, gridRow: row }}
    >
      {day.moments.map((moment) => {
        const { topPx, heightPx } = gridBlockPx(
          day.start,
          moment.start,
          moment.end,
          slotIncrement
        );
        return (
          <div
            key={moment.id}
            className="absolute inset-x-0 border-y border-dashed border-warning"
            style={{ top: topPx, height: heightPx, backgroundImage: STRIPES }}
          >
            <MomentPill
              moment={moment}
              label={`${moment.title} · ${time(moment.start)}–${time(moment.end)}`}
              nearTop={topPx < 10}
            />
          </div>
        );
      })}
    </div>
  );
}

function MomentPill({
  moment,
  label,
  nearTop,
}: {
  moment: SharedMoment;
  label: string;
  nearTop: boolean;
}) {
  return (
    <span
      className={`pointer-events-auto sticky block w-fit max-w-[16rem] rounded-full border border-warning bg-warning-tint px-2 text-[10px] font-medium leading-4 text-warning-fg ${nearTop ? "" : "-translate-y-1/2"}`}
      style={{ left: `calc(${GUTTER} + 0.25rem)` }}
    >
      {moment.description ? (
        <Tooltip
          toggleable
          content={<p className="p-2 text-sm">{moment.description}</p>}
          triggerClassName="block max-w-full truncate rounded-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          {label}
        </Tooltip>
      ) : (
        <span className="block truncate">{label}</span>
      )}
    </span>
  );
}
