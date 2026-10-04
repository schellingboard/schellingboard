import type { PeopleDeps } from "../ports";
import {
  createGuest,
  deleteGuest,
  ensureGuest,
  listGuests,
  sendTestEmail,
  updateGuest,
} from "./admin-guests";
import { assignGuestsToEvent, removeGuestsFromEvent } from "./event-guests";
import { importGuests } from "./guest-import";
import {
  getProfile,
  removeMyAvatar,
  replaceMyAvatar,
  updateMyProfile,
} from "./profiles";

export function createPeopleUseCases(deps: PeopleDeps) {
  return {
    getProfile: getProfile(deps),
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
