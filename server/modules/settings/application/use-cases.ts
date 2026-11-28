import type { SettingsDeps } from "../ports";
import {
  clearProxySecret,
  generateProxySecret,
  getProxySignIn,
  updateProxySignIn,
} from "./proxy-sign-in";
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
    getProxySignIn: getProxySignIn(deps),
    updateProxySignIn: updateProxySignIn(deps),
    generateProxySecret: generateProxySecret(deps),
    clearProxySecret: clearProxySecret(deps),
  };
}

export type SettingsUseCases = ReturnType<typeof createSettingsUseCases>;
