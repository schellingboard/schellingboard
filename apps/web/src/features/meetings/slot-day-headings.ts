import { DateTime } from "luxon";

type Window = { id: string; start: string; end: string };

/** One heading per day, in order; days sharing a date also name their window. */
export function slotDayHeadings(days: Window[], timezone: string): string[] {
  const zoned = (iso: string) => DateTime.fromISO(iso).setZone(timezone);
  const dateOf = (day: Window) =>
    zoned(day.start).toLocaleString({
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  const counts = new Map<string, number>();
  for (const day of days) {
    counts.set(dateOf(day), (counts.get(dateOf(day)) ?? 0) + 1);
  }
  return days.map((day) =>
    (counts.get(dateOf(day)) ?? 0) > 1
      ? `${dateOf(day)}, ${zoned(day.start).toFormat("HH:mm")}–${zoned(day.end).toFormat("HH:mm")}`
      : dateOf(day)
  );
}
