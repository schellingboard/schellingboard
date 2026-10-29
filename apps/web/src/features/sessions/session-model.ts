import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { Day } from "@schellingboard/domain/event";
import { dateOnDay } from "@schellingboard/domain/event";
import { formatSlotLabel, TIME_FORMAT } from "@schellingboard/domain/time";
import { DateTime } from "luxon";
import { slotIsFree } from "../schedule/column";

const MS_PER_MINUTE = 60 * 1000;

export type SessionRow = Snapshot["sessions"][number];

/** The picker's value for leaving a session in the several rooms an organizer gave it. */
export const KEEP_ROOMS = "keep-rooms";

export function dayFrom(day: Snapshot["days"][number]): Day {
  return {
    ...day,
    start: new Date(day.start),
    end: new Date(day.end),
    startBookings: new Date(day.startBookings),
    endBookings: new Date(day.endBookings),
  };
}

export type StartTime = {
  label: string;
  /** The slot's absolute start, as epoch milliseconds. */
  time: number;
  maxDuration: number;
  available: boolean;
};

/**
 * The slots a session could start in on `day`. It keeps the slot it occupies
 * while its rooms and day stay put: an organizer may have placed it off-limits.
 */
export function startTimesFor({
  day,
  sessions,
  own,
  unavailability,
  roomIds,
  staysInRooms,
  event,
}: {
  day: Day;
  sessions: SessionRow[];
  own: SessionRow | undefined;
  unavailability: Snapshot["unavailability"];
  roomIds: string[];
  staysInRooms: boolean;
  event: Pick<
    Snapshot["event"],
    "breakMinutes" | "slotIncrementMinutes" | "maxSessionDuration" | "timezone"
  >;
}): StartTime[] {
  const { breakMinutes, slotIncrementMinutes, maxSessionDuration, timezone } =
    event;
  const breakMs = breakMinutes * MS_PER_MINUTE;
  const locationSelected = roomIds.length > 0;
  const times = (start: string | null, end: string | null) => ({
    startTime: start ? new Date(start) : undefined,
    endTime: end ? new Date(end) : undefined,
  });
  const others = [
    ...sessions
      .filter(
        (s) =>
          s.locationIds.some((id) => roomIds.includes(id)) && s.id !== own?.id
      )
      .map((s) => times(s.startTime, s.endTime)),
    ...unavailability
      .filter((u) => roomIds.includes(u.locationId))
      .map((u) => times(u.start, u.end)),
  ];
  const maxDurationFrom = (slot: number) => {
    const nextStart = Math.min(
      day.endBookings.getTime(),
      ...others
        .map((s) => s.startTime?.getTime() ?? Infinity)
        .filter((start) => start >= slot + breakMs)
    );
    return Math.max(
      0,
      Math.min((nextStart - slot) / MS_PER_MINUTE, maxSessionDuration)
    );
  };
  const label = (slot: number) =>
    formatSlotLabel(new Date(slot + breakMs), day.start, timezone);

  const startTimes: StartTime[] = [];
  for (
    let t = day.startBookings.getTime();
    t < day.endBookings.getTime();
    t += slotIncrementMinutes * MS_PER_MINUTE
  ) {
    const available =
      !locationSelected ||
      slotIsFree(others, new Date(t), slotIncrementMinutes, breakMinutes);
    startTimes.push({
      label: label(t),
      time: t,
      maxDuration: !available
        ? 0
        : locationSelected
          ? maxDurationFrom(t)
          : maxSessionDuration,
      available,
    });
  }

  const ownStart = own?.startTime ? new Date(own.startTime) : undefined;
  if (ownStart && staysInRooms && dateOnDay(ownStart, day)) {
    const ownSlot = ownStart.getTime() - breakMs;
    const slot: StartTime = {
      label: label(ownSlot),
      time: ownSlot,
      maxDuration: maxDurationFrom(ownSlot),
      available: true,
    };
    const at = startTimes.findIndex((st) => st.time === ownSlot);
    if (at === -1) {
      startTimes.push(slot);
      startTimes.sort((a, b) => a.time - b.time);
    } else {
      startTimes[at] = slot;
    }
  }
  return startTimes;
}

export function minutesPastGrid(
  slot: number,
  dayStart: Date,
  incrementMinutes: number
): number {
  const minutes = (slot - dayStart.getTime()) / MS_PER_MINUTE;
  return ((minutes % incrementMinutes) + incrementMinutes) % incrementMinutes;
}

export function closestAtMost(choices: number[], wanted: number): number {
  const fitting = choices.filter((c) => c <= wanted);
  return fitting.length ? fitting[fitting.length - 1] : (choices[0] ?? 0);
}

export type HostClash = {
  guestName: string;
  kind: "hosting" | "attending" | "meeting" | "busy";
  title: string | null;
  start: string;
  end: string;
};

export function hostClashLine(clash: HostClash, timezone: string): string {
  const time = (iso: string) =>
    DateTime.fromISO(iso).setZone(timezone).toFormat(TIME_FORMAT);
  const interval = `from ${time(clash.start)} to ${time(clash.end)}`;
  return clash.kind === "hosting"
    ? `${clash.guestName} is hosting ${clash.title} ${interval}`
    : `${clash.guestName} is busy ${interval}`;
}
