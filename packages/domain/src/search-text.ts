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
