import type { Session, SessionCreateInput } from "./session";

export const CAPACITY_ERROR =
  "Max attendees must be a non-negative whole number";

/** Null when the value may be saved; absent means "whatever the room holds". */
export function sessionCapacityError(capacity: unknown): string | null {
  if (capacity === undefined) return null;
  if (
    typeof capacity !== "number" ||
    !Number.isInteger(capacity) ||
    capacity < 0
  )
    return CAPACITY_ERROR;
  return null;
}

export type SessionInterval = {
  start: Date;
  end: Date;
};

export function buildSessionInterval(
  startTime: Date,
  durationMinutes: number
): SessionInterval {
  return {
    start: startTime,
    end: new Date(startTime.getTime() + durationMinutes * 60 * 1000),
  };
}

/**
 * A session under way keeps the start its attendees turned up for. Everything
 * else about it, its duration included, is still the host's to fix.
 */
export function sessionHasStarted(
  session: Pick<Session, "startTime">,
  now: Date
): boolean {
  return !!session.startTime && session.startTime <= now;
}

export type SessionPlacementCode =
  | "session.titleRequired"
  | "session.hostRequired"
  | "session.locationRequired"
  | "session.endsBeforeStart"
  | "session.startsInPast"
  | "session.clash";

export const SESSION_PLACEMENT_CODES: ReadonlySet<string> =
  new Set<SessionPlacementCode>([
    "session.titleRequired",
    "session.hostRequired",
    "session.locationRequired",
    "session.endsBeforeStart",
    "session.startsInPast",
    "session.clash",
  ]);

// `now` is the effective current time (see docs/dev/adr/0004-dev-fake-clock.md),
// required rather than defaulted so a caller cannot silently bypass the fake
// clock and judge "in the past" against real time.
export function sessionPlacementError(
  session: SessionCreateInput,
  existingSessions: Session[],
  now: Date,
  opts?: { allowPastStart?: boolean }
): SessionPlacementCode | null {
  const sessionStart = session.startTime ?? new Date(0);
  const sessionEnd = session.endTime ?? new Date(0);
  if (!session.title) return "session.titleRequired";
  if (!session.hostIds[0]) return "session.hostRequired";
  if (!session.locationIds[0]) return "session.locationRequired";
  if (!(sessionStart < sessionEnd)) return "session.endsBeforeStart";
  if (!opts?.allowPastStart && !(sessionStart > now))
    return "session.startsInPast";
  const clashes = existingSessions.some(
    (existing) =>
      existing.locations.some((l) => session.locationIds.includes(l.id)) &&
      (existing.startTime ?? new Date(0)) < sessionEnd &&
      (existing.endTime ?? new Date(0)) > sessionStart
  );
  return clashes ? "session.clash" : null;
}
