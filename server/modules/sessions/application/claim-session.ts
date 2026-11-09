import type { ChangeContext } from "@schellingboard/domain/change";
import type { Session } from "@schellingboard/domain/session";
import { claimRefusal } from "@schellingboard/domain/session-claim";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import { forbidden, notFound, ok, type Result } from "@/server/kernel/result";
import type { SessionDeps } from "../ports";
import {
  changedMeanwhile,
  hostsOutsideEvent,
  managedByOrganizer,
  outsidePhase,
} from "./booking";
import { changeSession, removeRsvp } from "./session-changes";

export interface ClaimSessionInput {
  sessionId: string;
  expectedVersion: number;
}

export const claimSession =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    input: ClaimSessionInput,
    now: Date
  ): Promise<Result<Session>> =>
    deps.uow.run(async (tx) => {
      const acting = await actingGuest(actor, tx.guests);
      if (!acting.ok) return acting;
      const prev = await tx.sessions.findById(input.sessionId);
      if (!prev) return notFound("session.notFound", "Session not found");
      const event = await tx.events.findById(prev.eventId);
      const refusal = claimRefusal({
        event,
        now,
        guestInEvent: !(await hostsOutsideEvent(tx, prev.eventId, [
          acting.value,
        ])),
        session: prev,
      });
      if (refusal === "event.notSchedulingPhase")
        return outsidePhase("taken over");
      if (refusal === "session.managedByOrganizer")
        return managedByOrganizer("take over");
      if (refusal === "guest.notInEvent")
        return forbidden("guest.notInEvent", "You are not part of this event");
      if (refusal) return changedMeanwhile(tx, prev.id);

      const by: ChangeContext = {
        actor: { type: "guest", id: acting.value },
        at: now,
      };
      await removeRsvp(tx, prev.id, acting.value, by);
      const claimed = await changeSession(
        tx,
        prev.id,
        { hostIds: [acting.value], expectedVersion: input.expectedVersion },
        by
      );
      if (!claimed) return changedMeanwhile(tx, prev.id);
      return ok(claimed);
    });
