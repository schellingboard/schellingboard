import { DateTime } from "luxon";
import type { Day, Event } from "./event";
import { meetingSlotsForDay, slotTimeLabel } from "./meeting-slots";

export type SlotDay = {
  /** Two days may share a date, so the id is what keys them apart. */
  id: string;
  label: string;
  slots: { start: string; label: string }[];
};

/** Everything one event's availability form needs, ready to render. */
export type AvailabilityFormData = {
  eventId: string;
  eventName: string;
  timezone: string;
  days: SlotDay[];
  /** ISO slot starts, already narrowed to what the event still offers. */
  declared: string[];
};

/** The days of an event as the availability form lists them. */
export function slotDaysFor(event: Event, days: Day[]): SlotDay[] {
  const zoned = (date: Date) =>
    DateTime.fromJSDate(date).setZone(event.timezone);
  const dateOf = (day: Day) => zoned(day.start).toFormat("EEE d LLL");

  // Days only have to not overlap, so an event may legitimately run 09:00-12:00
  // and 14:00-18:00 on one date: the date alone is not a unique heading, and
  // the window disambiguates the ones that repeat.
  const dateCounts = new Map<string, number>();
  for (const day of days) {
    dateCounts.set(dateOf(day), (dateCounts.get(dateOf(day)) ?? 0) + 1);
  }

  return days
    .map((day) => ({
      id: day.id,
      label:
        (dateCounts.get(dateOf(day)) ?? 0) > 1
          ? `${dateOf(day)}, ${zoned(day.start).toFormat("HH:mm")}–${zoned(
              day.end
            ).toFormat("HH:mm")}`
          : dateOf(day),
      slots: meetingSlotsForDay(day, event.slotIncrementMinutes).map(
        (slot) => ({
          start: slot.start.toISOString(),
          label: slotTimeLabel(slot, event.breakMinutes, event.timezone),
        })
      ),
    }))
    .filter((day) => day.slots.length > 0);
}

/** Null when every day of the event is already over: nobody can be booked. */
export function availabilityFormFor(
  event: Event,
  days: Day[],
  declared: Date[],
  now: Date
): AvailabilityFormData | null {
  if (days.length > 0 && days.every((d) => d.end.getTime() <= now.getTime())) {
    return null;
  }
  const slotDays = slotDaysFor(event, days);
  // A day shortened or deleted after someone declared leaves rows for slots
  // the form no longer renders, and saving refuses any not offered: drop them.
  const offered = new Set(slotDays.flatMap((d) => d.slots.map((s) => s.start)));
  return {
    eventId: event.id,
    eventName: event.name,
    timezone: event.timezone,
    days: slotDays,
    declared: declared
      .map((d) => d.toISOString())
      .filter((start) => offered.has(start)),
  };
}
