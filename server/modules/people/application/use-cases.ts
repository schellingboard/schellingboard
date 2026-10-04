import type { PeopleDeps } from "../ports";
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
  };
}

export type PeopleUseCases = ReturnType<typeof createPeopleUseCases>;
