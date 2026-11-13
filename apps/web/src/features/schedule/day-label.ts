import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { Day } from "@schellingboard/domain/event";
import { TIME_FORMAT } from "@schellingboard/domain/time";
import { DateTime } from "luxon";

/** The day as a picker names it; a day running past midnight says where it ends. */
export function formatDayLabel(
  day: Day,
  timezone: string,
  format = TIME_FORMAT
): string {
  const start = DateTime.fromJSDate(day.start).setZone(timezone);
  const end = DateTime.fromJSDate(day.end).setZone(timezone);
  const label = start.toLocaleString({
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  // Strictly past midnight, not merely a different date: a day ending at
  // exactly 00:00 has no hours on the next date to explain.
  const spillsOver = end > start.startOf("day").plus({ days: 1 });
  if (!spillsOver) return label;
  const time = end.toFormat(format);
  const weekday = end.toLocaleString({ weekday: "short" });
  return i18n._(
    msg({
      message: `${label} (until ${time} ${weekday})`,
      comment:
        "Day heading when the day ends after midnight: date, end time, weekday of the end",
    })
  );
}
