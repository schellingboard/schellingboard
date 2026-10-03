import type { LocationUnavailability } from "./location";

type Placement = { locationId: string; start: Date; end: Date };

/**
 * Null when the booking keeps clear of every period its room is unavailable.
 * `kept` is the session's current placement: an organizer may have put it in
 * such a period, and time it already covers there is not booked anew.
 */
export function locationUnavailableError(
  periods: LocationUnavailability[],
  booking: Placement,
  kept?: Placement
): string | null {
  const clash = periods.some((p) => {
    if (p.locationId !== booking.locationId) return false;
    const from = Math.max(p.start.getTime(), booking.start.getTime());
    const until = Math.min(p.end.getTime(), booking.end.getTime());
    if (from >= until) return false;
    return !(
      kept?.locationId === booking.locationId &&
      from >= kept.start.getTime() &&
      until <= kept.end.getTime()
    );
  });
  return clash ? "The room is unavailable at that time" : null;
}
