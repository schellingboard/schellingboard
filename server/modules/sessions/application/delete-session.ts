import { inSchedPhase } from "@schellingboard/domain/phase";
import type { Session } from "@schellingboard/domain/session";
import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result } from "@/server/kernel/result";
import type { SessionDeps } from "../ports";
import { actingHost, managedByOrganizer, outsidePhase } from "./booking";

export const deleteSession =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    { sessionId }: { sessionId: string },
    now: Date
  ): Promise<Result<Session>> => {
    const { repos } = deps;
    const session = await repos.sessions.findById(sessionId);
    if (!session) return notFound("session.notFound", "Session not found");
    const event = await repos.events.findById(session.eventId);
    if (!event || !inSchedPhase(event, now)) return outsidePhase("deleted");
    if (session.adminManaged || session.blocker)
      return managedByOrganizer("delete");
    const host = await actingHost(actor, session, repos, "delete");
    if (!host.ok) return host;

    await repos.sessions.delete(session.id, {
      actor: { type: "guest", id: host.value },
      at: now,
    });
    deps.nudgeJobs();
    return ok(session);
  };
