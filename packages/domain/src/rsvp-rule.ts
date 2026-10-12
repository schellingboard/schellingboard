import type { Event } from "./event";
import { inSchedPhase, type SchedPhaseDates } from "./phase";
import type { Session } from "./session";

export type RsvpRefusal =
  | "guest.notInEvent"
  | "event.notSchedulingPhase"
  | "rsvp.ownSession"
  | "session.full";

export type RsvpRuleInput = {
  intent: "add" | "withdraw";
  event: (SchedPhaseDates & Pick<Event, "rsvpCapacityHardLimit">) | undefined;
  now: Date;
  guestId: string;
  guestInEvent: boolean;
  session: Pick<Session, "hosts" | "capacity" | "numRsvps">;
  alreadyRsvped: boolean;
};

/** A guest who already holds an RSVP is never refused for capacity. */
export function rsvpRefusal(input: RsvpRuleInput): RsvpRefusal | undefined {
  const { intent, event, now, guestId, session } = input;
  if (!input.guestInEvent) return "guest.notInEvent";
  if (!event || !inSchedPhase(event, now)) return "event.notSchedulingPhase";
  if (intent === "withdraw") return undefined;
  if (session.hosts.some((h) => h.id === guestId)) return "rsvp.ownSession";
  if (input.alreadyRsvped) return undefined;
  if (
    event.rsvpCapacityHardLimit &&
    session.capacity > 0 &&
    session.numRsvps >= session.capacity
  )
    return "session.full";
  return undefined;
}
