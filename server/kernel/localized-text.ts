import { msg } from "@lingui/core/macro";
import { DateTime } from "luxon";

import type { Translate } from "@/server/kernel/translator";

/**
 * A session or 1-on-1 time as instants and the event's zone, so each recipient
 * gets their own language. No `end` key is a single moment; a null `end` or
 * `start` is a session not fully scheduled.
 */
export type EmailTime = {
  start: string | null;
  end?: string | null;
  zone: string;
};

// Mails queued by an earlier version carry the text, already formatted.
export type TimeProp = EmailTime | string;
export type PlacesProp = string[] | string;

export function emailTime(
  start: Date | null | undefined,
  end: Date | null | undefined,
  zone: string
): EmailTime {
  return {
    start: start?.toISOString() ?? null,
    end: end?.toISOString() ?? null,
    zone,
  };
}

export function emailInstant(at: Date, zone: string): EmailTime {
  return { start: at.toISOString(), zone };
}

export const isUnscheduled = (time: TimeProp) =>
  typeof time !== "string" && (!time.start || time.end === null);

export const hasNoPlaces = (places: PlacesProp) =>
  Array.isArray(places) && places.length === 0;

// English keeps its established wording and order; other languages use the
// locale's own patterns.
const ENGLISH_DAY = "cccc d LLLL, HH:mm";
const DAY: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
};
const CLOCK: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
};

export function formatTime(time: TimeProp, t: Translate): string {
  if (typeof time === "string") return time;
  if (isUnscheduled(time)) return t(msg`Unscheduled`);
  const at = (iso: string) =>
    DateTime.fromISO(iso, { zone: time.zone, locale: t.locale });
  const english = t.locale.split("-")[0] === "en";
  const start = at(time.start!);
  const day = english ? start.toFormat(ENGLISH_DAY) : start.toLocaleString(DAY);
  if (!time.end) return day;
  const end = at(time.end);
  return `${day}–${english ? end.toFormat("HH:mm") : end.toLocaleString(CLOCK)}`;
}

export function formatPlaces(places: PlacesProp, t: Translate): string {
  if (typeof places === "string") return places;
  if (places.length === 0) return t(msg`No location`);
  return new Intl.ListFormat(t.locale, {
    type: "unit",
    style: "short",
  }).format(places);
}
