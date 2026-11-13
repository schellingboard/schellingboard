import { DateTime } from "luxon";

import type { Event } from "./event";

export const TIME_FORMAT = "HH:mm";

export type ClockStyle = "12h" | "24h";

export const clockFormat = (style: ClockStyle) =>
  style === "12h" ? "h:mm a" : TIME_FORMAT;

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
 * How a start time is offered: the clock time alone, or "Sat 01:10" once the
 * slot has crossed into the next date — on a day running past midnight the
 * times restart from 00:00, which otherwise reads as an earlier slot.
 */
export function formatSlotLabel(
  slot: Date,
  dayStart: Date,
  timezone: string,
  format = TIME_FORMAT
): string {
  const dt = DateTime.fromJSDate(slot).setZone(timezone);
  const start = DateTime.fromJSDate(dayStart).setZone(timezone);
  const time = dt.toFormat(format);
  return dt.hasSame(start, "day") ? time : `${dt.toFormat("EEE")} ${time}`;
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
