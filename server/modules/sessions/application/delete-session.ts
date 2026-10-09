import { inSchedPhase } from "@schellingboard/domain/phase";
import type { Session } from "@schellingboard/domain/session";
import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result } from "@/server/kernel/result";
import type { SessionDeps } from "../ports";
import { actingHost, managedByOrganizer, outsidePhase } from "./booking";
import { removeSession } from "./session-changes";

export const deleteSession =
  ({ uow }: SessionDeps) =>
  (
    actor: Actor,
    { sessionId }: { sessionId: string },
    now: Date
  ): Promise<Result<Session>> =>
    uow.run(async (tx) => {
      const session = await tx.sessions.findById(sessionId);
      if (!session) return notFound("session.notFound", "Session not found");
      const event = await tx.events.findById(session.eventId);
      if (!event || !inSchedPhase(event, now)) return outsidePhase("deleted");
      if (session.adminManaged || session.blocker)
        return managedByOrganizer("delete");
      const host = await actingHost(actor, session, tx, "delete");
      if (!host.ok) return host;

      await removeSession(tx, session.id, {
        actor: { type: "guest", id: host.value },
        at: now,
      });
      return ok(session);
    });
