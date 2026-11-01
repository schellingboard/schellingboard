import type { PeopleDeps } from "../ports";
import {
  createGuest,
  deleteGuest,
  ensureGuest,
  listGuests,
  sendTestEmail,
  setSiteAdmin,
  updateGuest,
} from "./admin-guests";
import {
  announceBootstrap,
  bootstrapAdmin,
  issueBootstrapToken,
} from "./bootstrap";
import {
  changePassword,
  getCredentials,
  listLoginSessions,
  requestResetLink,
  resetPassword,
  revokeLoginSession,
  setUsername,
  unprotect,
} from "./credentials";
import { assignGuestsToEvent, removeGuestsFromEvent } from "./event-guests";
import { importGuests } from "./guest-import";
import { createJoinLink, joinWithLink, mailJoinLinks } from "./join-links";
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
    getCredentials: getCredentials(deps),
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
    setSiteAdmin: setSiteAdmin(deps),
    issueBootstrapToken: issueBootstrapToken(deps),
    announceBootstrap: announceBootstrap(deps),
    bootstrapAdmin: bootstrapAdmin(deps),
    createJoinLink: createJoinLink(deps),
    mailJoinLinks: mailJoinLinks(deps),
    joinWithLink: joinWithLink(deps),
    assignGuestsToEvent: assignGuestsToEvent(deps),
    removeGuestsFromEvent: removeGuestsFromEvent(deps),
    importGuests: importGuests(deps),
  };
}

export type PeopleUseCases = ReturnType<typeof createPeopleUseCases>;
