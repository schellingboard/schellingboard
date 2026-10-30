import { DateTime } from "luxon";
import {
  calendarDayOf,
  dayIndexOf,
  dayTimeToUtc,
  utcToZonedInput,
  type DayRange,
} from "@schellingboard/domain/admin-datetime";
import type { AdminSessionBody } from "../../commands/admin-events";
import type { AdminSession } from "../../queries/admin-sessions";

export type DayOption = DayRange & { key: string; label: string };

export type SessionFormValues = {
  title: string;
  description: string;
  dayKey: string;
  startTime: string;
  endTime: string;
  /** null while it follows the room's capacity. */
  capacity: string | null;
  adminManaged: boolean;
  blocker: boolean;
  closed: boolean;
  hostIds: string[];
  locationIds: string[];
};

/** Sessions an admin creates stay under admin control instead of their hosts'. */
export const EMPTY_SESSION: SessionFormValues = {
  title: "",
  description: "",
  dayKey: "",
  startTime: "",
  endTime: "",
  capacity: null,
  adminManaged: true,
  blocker: false,
  closed: false,
  hostIds: [],
  locationIds: [],
};

/** A session on a date outside the event's days keeps it as an extra option, so editing does not unschedule it. */
export function sessionFormValues(
  session: AdminSession,
  days: DayOption[],
  timezone: string
): { values: SessionFormValues; days: DayOption[] } {
  const values: SessionFormValues = {
    title: session.title,
    description: session.description,
    dayKey: "",
    startTime: "",
    endTime: "",
    capacity: String(session.capacity),
    adminManaged: session.adminManaged,
    blocker: session.blocker,
    closed: session.closed,
    hostIds: session.hosts.map((h) => h.id),
    locationIds: session.locations.map((l) => l.id),
  };
  if (!session.startTime || !session.endTime) return { values, days };
  const time = (iso: string) => utcToZonedInput(iso, timezone).slice(11);
  const scheduled = {
    ...values,
    startTime: time(session.startTime),
    endTime: time(session.endTime),
  };
  const index = dayIndexOf(session.startTime, days, timezone);
  if (index >= 0)
    return { values: { ...scheduled, dayKey: days[index].key }, days };
  const other: DayOption = {
    key: "other",
    label: `${utcToZonedInput(session.startTime, timezone).slice(0, 10)} (not an event day)`,
    ...calendarDayOf(session.startTime, timezone),
  };
  return {
    values: { ...scheduled, dayKey: other.key },
    days: [...days, other],
  };
}

const instantOrNull = (
  day: DayRange | undefined,
  time: string,
  timezone: string
) => (day && dayTimeToUtc(day, time, timezone)) || null;

/** The start instant the form points at, moved by the break when asked; null without a day or time. */
export function startInstant(
  values: Pick<SessionFormValues, "dayKey" | "startTime">,
  days: DayOption[],
  timezone: string,
  breakShiftMinutes = 0
): string | null {
  const start = instantOrNull(
    days.find((d) => d.key === values.dayKey),
    values.startTime,
    timezone
  );
  if (!start || !breakShiftMinutes) return start;
  return (
    DateTime.fromISO(start)
      .plus({ minutes: breakShiftMinutes })
      .toUTC()
      .toISO() ?? start
  );
}

export const CAPACITY_ERROR = "Capacity must be a non-negative whole number";

/** The request body, or the field errors that stop it. An empty capacity means 0. */
export function sessionBody(
  values: SessionFormValues,
  days: DayOption[],
  timezone: string,
  breakShiftMinutes = 0
): { body?: AdminSessionBody; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const day = days.find((d) => d.key === values.dayKey);
  if (day && !values.startTime) errors.startTime = "Start is required";
  if (day && !values.endTime) errors.endTime = "End is required";
  const capacity = values.capacity === "" ? 0 : Number(values.capacity);
  if (!Number.isInteger(capacity) || capacity < 0)
    errors.capacity = CAPACITY_ERROR;
  if (Object.keys(errors).length > 0) return { errors };
  const startTime = startInstant(values, days, timezone, breakShiftMinutes);
  return {
    errors,
    body: {
      title: values.title,
      description: values.description,
      startTime,
      endTime: instantOrNull(day, values.endTime, timezone),
      capacity,
      adminManaged: values.adminManaged,
      blocker: values.blocker,
      closed: values.closed,
      hostIds: values.hostIds,
      locationIds: values.locationIds,
    },
  };
}
