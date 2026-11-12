import { DateTime } from "luxon";
import type { Event } from "@schellingboard/domain/event";

export function schedulingNotice(event: Event, now: Date): string | null {
  const opens = event.schedulingPhaseStart;
  if (!opens || opens.getTime() <= now.getTime()) return null;
  const when = DateTime.fromJSDate(opens).setZone(event.timezone);
  return `Scheduling opens on ${when.toFormat("EEEE d MMMM yyyy, HH:mm ZZZZ")}.`;
}
