import { DateTime } from "luxon";

// Admin forms edit times in the event's timezone, but the server actions and
// the database speak UTC. These helpers convert between the two at the client
// boundary. An unrecognized timezone falls back to UTC in BOTH directions so
// values always round-trip without shifting.

const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

/**
 * UTC ISO string → `datetime-local` input value ("yyyy-MM-ddTHH:mm") in the
 * given IANA timezone. Returns "" for null/empty/unparseable input.
 */
export function utcToZonedInput(
  utcIso: string | null | undefined,
  timezone: string
): string {
  if (!utcIso) return "";
  const dt = DateTime.fromISO(utcIso, { zone: "utc" });
  if (!dt.isValid) return "";
  const zoned = dt.setZone(timezone);
  return (zoned.isValid ? zoned : dt).toFormat(INPUT_FORMAT);
}

/**
 * `datetime-local` input value in the given IANA timezone → UTC
 * "yyyy-MM-ddTHH:mm" (the wire format the admin actions expect). Returns ""
 * for empty/unparseable input.
 */
export function zonedInputToUtc(value: string, timezone: string): string {
  if (!value.trim()) return "";
  let dt = DateTime.fromISO(value, { zone: timezone });
  if (!dt.isValid) dt = DateTime.fromISO(value, { zone: "utc" });
  if (!dt.isValid) return "";
  return dt.toUTC().toFormat(INPUT_FORMAT);
}

export type DayRange = { start: string; end: string };

/**
 * "HH:mm" on an event day → UTC ISO. A time before the day's start lands on
 * the next date only when the day runs past midnight and still covers it.
 */
export function dayTimeToUtc(
  day: DayRange,
  time: string,
  timezone: string
): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return "";
  const dayStart = DateTime.fromISO(day.start, { zone: "utc" }).setZone(
    timezone
  );
  const dayEnd = DateTime.fromISO(day.end, { zone: "utc" });
  let dt = dayStart.set({
    hour: Number(match[1]),
    minute: Number(match[2]),
    second: 0,
    millisecond: 0,
  });
  if (dt < dayStart && dt.plus({ days: 1 }) <= dayEnd)
    dt = dt.plus({ days: 1 });
  return dt.toUTC().toISO() ?? "";
}

/** The day whose date `dayTimeToUtc` would put the instant's local time on. */
export function dayIndexOf(
  utcIso: string,
  days: DayRange[],
  timezone: string
): number {
  const t = new Date(utcIso).getTime();
  const time = DateTime.fromMillis(t, { zone: timezone }).toFormat("HH:mm");
  return days.findIndex(
    (d) => new Date(dayTimeToUtc(d, time, timezone)).getTime() === t
  );
}

/** The whole local calendar date containing the instant, as a DayRange. */
export function calendarDayOf(utcIso: string, timezone: string): DayRange {
  const start = DateTime.fromISO(utcIso, { zone: "utc" })
    .setZone(timezone)
    .startOf("day");
  return {
    start: start.toUTC().toISO() ?? "",
    end: start.plus({ days: 1 }).toUTC().toISO() ?? "",
  };
}
