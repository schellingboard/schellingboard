/**
 * What the SPA schedule cannot show yet: the session and 1-on-1 modals, and
 * kiosk mode (asked for with `?kiosk`, remembered by the `kiosk` cookie). Those
 * addresses stay with the legacy schedule until their screens move.
 */
export function scheduleStaysInLegacy(search: string, cookies: string) {
  const params = new URLSearchParams(search);
  return (
    params.has("viewSession") ||
    params.has("viewMeeting") ||
    params.has("kiosk") ||
    cookies.split("; ").some((entry) => entry.split("=")[0] === "kiosk")
  );
}
