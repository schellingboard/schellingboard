const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
// Calendar-free approximations: the label is a rough hint ("last month"), and
// rounding a 31st onto a 30th would not change what the reader takes from it.
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const UNITS: [ms: number, unit: Intl.RelativeTimeFormatUnit][] = [
  [YEAR, "year"],
  [MONTH, "month"],
  [DAY, "day"],
  [HOUR, "hour"],
  [MINUTE, "minute"],
];

const formats = new Map<string, Intl.RelativeTimeFormat>();
const formatterFor = (locale: string) => {
  let format = formats.get(locale);
  if (!format) {
    format = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    formats.set(locale, format);
  }
  return format;
};

/**
 * A coarse "3 days ago" / "yesterday" label for `date` seen from `now`. Both
 * are explicit so the caller decides which clock applies (server render, dev
 * fake clock). Sub-minute and future timestamps — the two servers involved
 * need not agree to the second — collapse to "just now".
 */
export function formatRelativeTime(
  date: Date,
  now: Date,
  locale = "en"
): string {
  const elapsed = now.getTime() - date.getTime();
  for (const [ms, unit] of UNITS) {
    if (elapsed >= ms)
      return formatterFor(locale).format(-Math.floor(elapsed / ms), unit);
  }
  return "just now";
}
