/**
 * Pages of the legacy app directly under its root, which an event's slug must
 * not be taken for: `/settings` is the settings page, never an event named so.
 */
export const LEGACY_ROOT_PAGES = [
  "admin",
  "auth",
  "login",
  "notifications",
  "settings",
] as const;
