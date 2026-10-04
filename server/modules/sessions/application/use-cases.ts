import type { SessionDeps } from "../ports";
import {
  adminCreateSession,
  adminDeleteSession,
  adminUpdateSession,
} from "./admin-sessions";
import { createSession } from "./create-session";
import { deleteSession } from "./delete-session";
import { getSession, listSessions } from "./queries";
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
  };
}

export type SessionUseCases = ReturnType<typeof createSessionUseCases>;
