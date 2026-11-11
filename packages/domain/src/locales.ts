export const LOCALES = ["en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

const baseOf = (tag: string) => tag.toLowerCase().split("-")[0];

export function supportedLocale(
  tag: string,
  locales: readonly string[] = LOCALES
): Locale | undefined {
  const lower = tag.toLowerCase();
  const found =
    locales.find((locale) => locale.toLowerCase() === lower) ??
    locales.find((locale) => baseOf(locale) === baseOf(tag));
  return found as Locale | undefined;
}

export function resolveLocale(
  stored: string | null | undefined,
  browserLanguages: readonly string[],
  locales: readonly string[] = LOCALES
): Locale {
  for (const tag of [stored, ...browserLanguages]) {
    const match = tag ? supportedLocale(tag, locales) : undefined;
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}
