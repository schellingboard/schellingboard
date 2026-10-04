import type { SessionDeps } from "../ports";
import {
  adminCreateSession,
  adminDeleteSession,
  adminSeedSession,
  adminUpdateSession,
} from "./admin-sessions";
import { getAttendeeCount, recordAttendeeCount } from "./attendee-count";
import { createSession } from "./create-session";
import { deleteSession } from "./delete-session";
import { getSession, listSessions } from "./queries";
import {
  addLocationUnavailability,
  deleteLocationUnavailability,
  listLocationUnavailability,
} from "./room-unavailability";
import {
  adminAddRsvp,
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
    adminSeedSession: adminSeedSession(deps),
    rsvp: rsvp(deps),
    withdrawRsvp: withdrawRsvp(deps),
    listSessionRsvps: listSessionRsvps(deps),
    listGuestRsvps: listGuestRsvps(deps),
    adminAddRsvp: adminAddRsvp(deps),
    adminRemoveRsvp: adminRemoveRsvp(deps),
    getAttendeeCount: getAttendeeCount(deps),
    recordAttendeeCount: recordAttendeeCount(deps),
    listLocationUnavailability: listLocationUnavailability(deps),
    addLocationUnavailability: addLocationUnavailability(deps),
    deleteLocationUnavailability: deleteLocationUnavailability(deps),
  };
}

export type SessionUseCases = ReturnType<typeof createSessionUseCases>;
