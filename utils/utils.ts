/**
 * Derives the URL slug for a new event from its name. Only used at event
 * creation: the slug is stored on the event and stays stable across renames,
 * so for anything else read `event.slug` / `EventsRepository.findBySlug`
 * instead of re-deriving it (slugification is lossy and cannot be reversed).
 *
 * The slug must be safe as a single URL path segment (`/[eventSlug]`), so
 * anything other than letters, numbers, and hyphens is replaced with a
 * hyphen; runs are collapsed and edge hyphens trimmed. Can return "" when
 * the name has no safe characters — callers must reject that.
 */
export function eventNameToSlug(name: string): string {
  return name
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Normalizes an admin-entered website value into a URL with a scheme, so it
 * can be used directly as a link href. Admins may enter a bare domain
 * ("example.com") or a full URL ("https://example.com"); prefixing a scheme
 * unconditionally would turn the latter into "https://https://example.com".
 */
export function normalizeWebsiteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Top-level route segments served by this app (see app/); an event slug
// matching one of these would shadow or be shadowed by that route.
export const RESERVED_EVENT_SLUGS = new Set([
  "admin",
  "api",
  "guests",
  "login",
  "media",
  "notifications",
  "settings",
]);

/**
 * URL for fetching a guest's votes. Encodes both values so reserved URL
 * characters (e.g. in legacy slugs stored before sanitization, like "&")
 * cannot corrupt the query string.
 */
export function votesApiUrl(user: string, eventSlug: string): string {
  const params = new URLSearchParams({ user, event: eventSlug });
  return `/api/votes?${params.toString()}`;
}

/**
 * Trims, transforms to lowercase and removes accents from a string. Applied to
 * both sides of a search comparison, so "jose" finds "José" and vice versa.
 *
 * `normalizeForSearch("äùàÆåñ") === "auaæan"`
 *
 * Accent stripping from https://stackoverflow.com/a/37511463/1181553
 */
export function normalizeForSearch(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Like `String.includes`, but ignoring case and diacritics
 *
 * @param haystack The string to search in
 * @param needle The string to search for
 */
export function containsIgnoringAccents(
  haystack: string,
  needle: string
): boolean {
  return normalizeForSearch(haystack).includes(normalizeForSearch(needle));
}

/** Like `===`, but ignoring case and diacritics */
export function equalsIgnoringAccents(a: string, b: string): boolean {
  return normalizeForSearch(a) === normalizeForSearch(b);
}
