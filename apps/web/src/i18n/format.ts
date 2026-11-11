import type { ClockStyle } from "@schellingboard/domain/time";

const baseLanguage = (tag: string) => tag.split("-")[0].toLowerCase();

/**
 * The locale dates, times and numbers follow: the app's language, with the
 * region the browser asks for when it is the same language (en + en-GB).
 */
export function formatLocale(
  locale: string,
  browserLanguages: readonly string[]
): string {
  const regional = browserLanguages.find(
    (tag) => baseLanguage(tag) === baseLanguage(locale)
  );
  if (regional) return regional;
  return locale.includes("-")
    ? locale
    : withRegionOf(locale, browserLanguages[0]);
}

// A German-only browser still gets its region's date and clock habits in English.
function withRegionOf(locale: string, browserTag: string | undefined) {
  try {
    const region = browserTag && new Intl.Locale(browserTag).maximize().region;
    return region ? `${locale}-${region}` : locale;
  } catch {
    return locale;
  }
}

export function clockStyleFor(locale: string): ClockStyle {
  const cycle = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
  }).resolvedOptions().hourCycle;
  return cycle === "h11" || cycle === "h12" ? "12h" : "24h";
}
