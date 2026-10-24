/**
 * What the SPA schedule cannot show yet: the 1-on-1 modal. Its addresses stay
 * with the legacy schedule until the meetings screens move.
 */
export function scheduleStaysInLegacy(search: string) {
  return new URLSearchParams(search).has("viewMeeting");
}
