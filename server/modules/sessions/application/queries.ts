import type { Session } from "@schellingboard/domain/session";
import type { Actor } from "@/server/kernel/actor";
import { notFound, ok, type Result } from "@/server/kernel/result";
import type { SessionDeps } from "../ports";

// Sessions are public to everyone past the site password; the actor is part
// of the signature so a visibility rule can arrive without changing callers.
export const getSession =
  ({ repos }: SessionDeps) =>
  async (
    _actor: Actor,
    { sessionId }: { sessionId: string }
  ): Promise<Result<Session>> => {
    const session = await repos.sessions.findById(sessionId);
    return session
      ? ok(session)
      : notFound("session.notFound", "Session not found");
  };

export const listSessions =
  ({ repos }: SessionDeps) =>
  async (
    _actor: Actor,
    { eventId }: { eventId: string }
  ): Promise<Result<Session[]>> => {
    if (!(await repos.events.findById(eventId)))
      return notFound("event.notFound", "Event not found");
    return ok(await repos.sessions.listByEvent(eventId));
  };
