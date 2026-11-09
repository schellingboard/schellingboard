import { inSchedPhase, type SchedPhaseDates } from "./phase";
import type { Session } from "./session";

export type ClaimRefusal =
  | "event.notSchedulingPhase"
  | "session.managedByOrganizer"
  | "guest.notInEvent"
  | "session.hasHost";

export function claimRefusal(input: {
  event: SchedPhaseDates | undefined;
  now: Date;
  guestInEvent: boolean;
  session: Pick<Session, "adminManaged" | "blocker"> & {
    hosts: readonly unknown[];
  };
}): ClaimRefusal | undefined {
  const { event, now, session } = input;
  if (!event || !inSchedPhase(event, now)) return "event.notSchedulingPhase";
  if (session.adminManaged || session.blocker)
    return "session.managedByOrganizer";
  if (!input.guestInEvent) return "guest.notInEvent";
  if (session.hosts.length > 0) return "session.hasHost";
  return undefined;
}
