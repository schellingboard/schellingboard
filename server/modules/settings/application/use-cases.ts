import type { SettingsDeps } from "../ports";
import { getSiteSettings, updateSiteSettings } from "./settings";

export function createSettingsUseCases(deps: SettingsDeps) {
  return {
    getSiteSettings: getSiteSettings(deps),
    updateSiteSettings: updateSiteSettings(deps),
  };
}

export type SettingsUseCases = ReturnType<typeof createSettingsUseCases>;
