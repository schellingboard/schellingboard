import type { SettingsDeps } from "../ports";
import {
  getSiteSettings,
  getPublicSiteSettings,
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
