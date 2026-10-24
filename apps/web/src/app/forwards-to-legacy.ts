/**
 * What the SPA schedule cannot show yet: the session and 1-on-1 modals. Those
 * addresses stay with the legacy schedule until their screens move.
 */
export function scheduleStaysInLegacy(search: string) {
  const params = new URLSearchParams(search);
  return params.has("viewSession") || params.has("viewMeeting");
}
