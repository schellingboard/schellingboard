import type { CreateSessionInput } from "@/server/modules/sessions/module";
import type { Location } from "@schellingboard/domain/location";
import type { Guest } from "@schellingboard/domain/guest";

export type SessionParams = {
  id?: string;
  title: string;
  description: string;
  closed: boolean;
  hosts: Guest[];
  location: Location;
  /**
   * An edit that leaves a session in the several rooms an organizer gave it
   * names them all here; otherwise `location` is the session's one room.
   */
  locationIds?: string[];
  /** The day is resolved from the store: its window bounds what may be booked. */
  dayId: string;
  /**
   * The chosen slot as an ISO instant, not a time of day: a day window may run
   * past midnight, so a wall-clock time alone doesn't say which date it means.
   */
  startTime: string;
  duration: number;
  /**
   * The host's own attendee maximum, 0 meaning no limit. Absent falls back to
   * the chosen location's capacity.
   */
  capacity?: number;
  proposal?: string;
};

export function legacyBooking(
  params: SessionParams
): Omit<CreateSessionInput, "locationId"> {
  return {
    // Anything but a string reaches the query as an unbindable parameter, which
    // fails as a server error rather than a rejected request.
    dayId: typeof params.dayId === "string" ? params.dayId : "",
    title: params.title,
    description: params.description,
    closed: params.closed,
    hostIds: Array.isArray(params.hosts) ? params.hosts.map((h) => h.id) : [],
    startTime: new Date(params.startTime),
    durationMinutes: params.duration,
    capacity: params.capacity,
    proposalId: params.proposal ?? undefined,
  };
}
