/**
 * Pages of the legacy app directly under its root, which an event's slug must
 * not be taken for: `/login` is the sign-in page, never an event named so.
 */
export const LEGACY_ROOT_PAGES = ["admin", "login"] as const;
