/** UTC first, then every zone this browser knows. */
export const timezones = () => {
  const all =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [];
  return Array.from(new Set(["UTC", ...all]));
};
