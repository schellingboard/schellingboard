export {
  DEFAULT_LOCALE,
  LOCALES,
  resolveLocale,
  supportedLocale,
  type Locale,
} from "@schellingboard/domain/locales";

export const PSEUDO_LOCALE = "pseudo-LOCALE";

/** A language in its own words, without the region: "Español", not "español de España". */
export function languageName(locale: string) {
  const language = locale.split("-")[0];
  const name =
    new Intl.DisplayNames([locale], { type: "language" }).of(language) ??
    language;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}
