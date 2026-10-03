import { DateTime } from "luxon";
import type { Event, Day } from "./event";

// Changing this to am/pm needs a wider time column in the schedule grid (see
// https://github.com/schellingboard/schellingboard-legacy/pull/402/changes).
export const TIME_FORMAT = "HH:mm";

export const DATETIME_FORMAT = `${TIME_FORMAT} - dd MMM`;

export function formatInLocalZone(
  date: Date,
  eventZone: string,
  localZone: string | null
): string {
  const shown = DateTime.fromJSDate(date).setZone(localZone ?? eventZone);
  const atEvent = DateTime.fromJSDate(date).setZone(eventZone);
  return shown.toFormat(
    shown.offset === atEvent.offset
      ? DATETIME_FORMAT
      : `${DATETIME_FORMAT} ZZZZ`
  );
}

export function formatEventDates(
  event: Pick<Event, "firstDayStart" | "lastDayStart" | "timezone">,
  format = "LLL d"
): string | undefined {
  if (!event.firstDayStart || !event.lastDayStart) return undefined;
  const [from, to] = [event.firstDayStart, event.lastDayStart].map((d) =>
    DateTime.fromJSDate(d).setZone(event.timezone).toFormat(format)
  );
  return from === to ? from : `${from} - ${to}`;
}

export const getPercentThroughDay = (now: Date, start: Date, end: Date) =>
  ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;

export const convertParamDateTime = (
  date: string,
  time: string,
  timezone: string
) => {
  return DateTime.fromISO(`${date}T${time}:00`, { zone: timezone }).toJSDate();
};

/**
 * How a day is named where one has to be picked: "Friday, June 13", and for a
 * day whose window runs past midnight the hour it ends — "Friday, June 13
 * (until 03:00 Sat)". Without that suffix nothing tells a host which of two
 * adjacent days owns 01:00.
 */
export function formatDayLabel(day: Day, timezone: string): string {
  const start = DateTime.fromJSDate(day.start).setZone(timezone);
  const end = DateTime.fromJSDate(day.end).setZone(timezone);
  const label = start.toFormat("EEEE, MMMM d");
  // Strictly past midnight, not merely a different date: a day ending at
  // exactly 00:00 has no hours on the next date to explain.
  const spillsOver = end > start.startOf("day").plus({ days: 1 });
  return spillsOver
    ? `${label} (until ${end.toFormat(TIME_FORMAT)} ${end.toFormat("EEE")})`
    : label;
}

/**
 * How a start time is offered: the clock time alone, or "Sat 01:10" once the
 * slot has crossed into the next date — on a day running past midnight the
 * times restart from 00:00, which otherwise reads as an earlier slot.
 */
export function formatSlotLabel(
  slot: Date,
  dayStart: Date,
  timezone: string
): string {
  const dt = DateTime.fromJSDate(slot).setZone(timezone);
  const start = DateTime.fromJSDate(dayStart).setZone(timezone);
  const time = dt.toFormat(TIME_FORMAT);
  return dt.hasSame(start, "day") ? time : `${dt.toFormat("EEE")} ${time}`;
}

/**
 * Format duration minutes into a string (e.g., "25m", "1h 20m", "2 hours 50 minutes")
 */
export function formatDuration(
  minutes: number,
  longFormat: boolean = false
): string {
  const minuteString = longFormat ? " minutes" : "m";
  if (minutes < 60) return `${minutes}${minuteString}`;
  const hours = Math.floor(minutes / 60);
  const hourString = longFormat ? (hours === 1 ? " hour" : " hours") : "h";
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}${hourString} ${remainingMinutes}${minuteString}`
    : `${hours}${hourString}`;
}

/** Stands in for a session time the type allows to be absent. */
const TIME_PLACEHOLDER = "—";

/**
 * Formats a session time that the type allows to be absent. Scheduled sessions
 * always have times, but falling back to another instant — the current time, or
 * the epoch — would print a plausible-looking wrong time; the placeholder is
 * visibly not a time.
 */
export function formatOptionalTime(
  time: Date | undefined,
  timezone: string,
  format: string
): string {
  if (!time) return TIME_PLACEHOLDER;
  return DateTime.fromJSDate(time).setZone(timezone).toFormat(format);
}
