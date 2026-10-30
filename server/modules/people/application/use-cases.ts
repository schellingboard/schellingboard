import type { PeopleDeps } from "../ports";
import {
  createGuest,
  deleteGuest,
  ensureGuest,
  listGuests,
  sendTestEmail,
  updateGuest,
} from "./admin-guests";
import {
  changePassword,
  listLoginSessions,
  requestResetLink,
  resetPassword,
  revokeLoginSession,
  setUsername,
  unprotect,
} from "./credentials";
import { assignGuestsToEvent, removeGuestsFromEvent } from "./event-guests";
import { importGuests } from "./guest-import";
import { logIn, requestLoginCode } from "./sign-in";
import { chooseGuest, currentGuest, signIn, signOut } from "./identity";
import {
  getProfile,
  getProfileActivity,
  listAttendees,
  listEventProfiles,
  removeMyAvatar,
  replaceMyAvatar,
  updateMyProfile,
} from "./profiles";

export function createPeopleUseCases(deps: PeopleDeps) {
  return {
    chooseGuest: chooseGuest(deps),
    currentGuest: currentGuest(deps),
    signIn: signIn(deps),
    signOut: signOut(deps),
    requestLoginCode: requestLoginCode(deps),
    logIn: logIn(deps),
    requestResetLink: requestResetLink(deps),
    resetPassword: resetPassword(deps),
    changePassword: changePassword(deps),
    unprotect: unprotect(deps),
    setUsername: setUsername(deps),
    listLoginSessions: listLoginSessions(deps),
    revokeLoginSession: revokeLoginSession(deps),
    getProfile: getProfile(deps),
    getProfileActivity: getProfileActivity(deps),
    listAttendees: listAttendees(deps),
    listEventProfiles: listEventProfiles(deps),
    updateMyProfile: updateMyProfile(deps),
    replaceMyAvatar: replaceMyAvatar(deps),
    removeMyAvatar: removeMyAvatar(deps),
    listGuests: listGuests(deps),
    createGuest: createGuest(deps),
    ensureGuest: ensureGuest(deps),
    updateGuest: updateGuest(deps),
    deleteGuest: deleteGuest(deps),
    sendTestEmail: sendTestEmail(deps),
    assignGuestsToEvent: assignGuestsToEvent(deps),
    removeGuestsFromEvent: removeGuestsFromEvent(deps),
    importGuests: importGuests(deps),
  };
}

export type PeopleUseCases = ReturnType<typeof createPeopleUseCases>;
