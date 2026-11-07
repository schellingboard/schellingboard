/** UTC first, then every zone this browser knows. */
export const timezones = () => {
  const all =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [];
  return Array.from(new Set(["UTC", ...all]));
};

const squash = (text: string) => text.toLowerCase().replace(/[\s_]+/g, "");

export function matchingZones(zones: string[], typed: string) {
  if (zones.includes(typed)) return zones;
  const needle = squash(typed);
  return zones.filter((tz) => squash(tz).includes(needle));
}
