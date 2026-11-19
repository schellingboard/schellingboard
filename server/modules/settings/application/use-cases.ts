import type { SettingsDeps } from "../ports";
import {
  getPublicSiteSettings,
  getSiteSettings,
  updateSiteSettings,
} from "./settings";

export function createSettingsUseCases(deps: SettingsDeps) {
  return {
    getSiteSettings: getSiteSettings(deps),
    getPublicSiteSettings: getPublicSiteSettings(deps),
    updateSiteSettings: updateSiteSettings(deps),
  };
}

export type SettingsUseCases = ReturnType<typeof createSettingsUseCases>;
