import { attendeeCountSchema } from "@schellingboard/contracts/attendee-count";
import { actingGuest } from "@/server/kernel/acting-guest";
import type { Actor } from "@/server/kernel/actor";
import {
  conflict,
  forbidden,
  invalid,
  ok,
  type Result,
} from "@/server/kernel/result";
import type { SessionDeps } from "../ports";

// Deliberately the same refusal for "not your session" and "no such session":
// a distinct one would let a prober map out sessions they don't host.
const notHost = () =>
  forbidden(
    "attendeeCount.notHost",
    "Only this session's hosts can see its attendee count"
  );

// Shared by the read and the write so they cannot drift apart: the read is
// what a prober would use to find a gap in the write.
async function authorizedSession(
  { repos }: SessionDeps,
  actor: Actor,
  sessionId: string,
  now: Date
): Promise<Result<void>> {
  const acting = await actingGuest(actor, repos.guests);
  if (!acting.ok) return acting;
  const session = await repos.sessions.findById(sessionId);
  if (!session?.hosts.some((host) => host.id === acting.value))
    return notHost();
  if (!session.endTime || session.endTime > now)
    return conflict(
      "attendeeCount.sessionNotFinished",
      "The attendee count can be recorded once the session has finished"
    );
  return ok(undefined);
}

export const getAttendeeCount =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    { sessionId }: { sessionId: string },
    now: Date
  ): Promise<Result<number | null>> => {
    const authorized = await authorizedSession(deps, actor, sessionId, now);
    if (!authorized.ok) return authorized;
    return ok(await deps.repos.sessions.getAttendeeCount(sessionId));
  };

export const recordAttendeeCount =
  (deps: SessionDeps) =>
  async (
    actor: Actor,
    { sessionId, count }: { sessionId: string; count: unknown },
    now: Date
  ): Promise<Result<number | null>> => {
    // Authorization before validation (Constitution IV): a stranger must not
    // be able to probe the validation rules of a session that isn't theirs.
    const authorized = await authorizedSession(deps, actor, sessionId, now);
    if (!authorized.ok) return authorized;

    const parsed = attendeeCountSchema.safeParse(count);
    if (!parsed.success)
      return invalid("attendeeCount.invalid", parsed.error.issues[0].message);

    const { sessions } = deps.repos;
    await sessions.setAttendeeCount(sessionId, parsed.data);
    // The stored value, not the submitted one, so two saves racing each other
    // converge on what is actually in the database (SC-007).
    return ok(await sessions.getAttendeeCount(sessionId));
  };
