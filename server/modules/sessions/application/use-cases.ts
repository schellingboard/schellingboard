import type { SessionDeps } from "../ports";
import {
  adminCreateSession,
  adminDeleteSession,
  adminUpdateSession,
} from "./admin-sessions";
import { createSession } from "./create-session";
import { deleteSession } from "./delete-session";
import { getSession, listSessions } from "./queries";
import {
  adminRemoveRsvp,
  listGuestRsvps,
  listSessionRsvps,
  rsvp,
  withdrawRsvp,
} from "./rsvps";
import { updateSession } from "./update-session";

export function createSessionUseCases(deps: SessionDeps) {
  return {
    getSession: getSession(deps),
    listSessions: listSessions(deps),
    createSession: createSession(deps),
    updateSession: updateSession(deps),
    deleteSession: deleteSession(deps),
    adminCreateSession: adminCreateSession(deps),
    adminUpdateSession: adminUpdateSession(deps),
    adminDeleteSession: adminDeleteSession(deps),
    rsvp: rsvp(deps),
    withdrawRsvp: withdrawRsvp(deps),
    listSessionRsvps: listSessionRsvps(deps),
    listGuestRsvps: listGuestRsvps(deps),
    adminRemoveRsvp: adminRemoveRsvp(deps),
  };
}

export type SessionUseCases = ReturnType<typeof createSessionUseCases>;
