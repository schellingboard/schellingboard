import { formatInLocalZone } from "@schellingboard/domain/time";

/**
 * Describes when a phase opens, in the reader's own timezone: attendees often
 * read this weeks before travelling to the venue, so what they need is when
 * voting or scheduling opens on *their* clock, not the venue's.
 *
 * Both zones are parameters rather than read ambiently — formatting in the
 * process's own zone made a UTC container disagree with the visitor's browser
 * about the same instant (#734). Pass `localZone` from `useLocalZone`, which
 * is null until mount.
 */
export function dateStartDescription(
  date: Date | undefined,
  eventZone: string,
  localZone: string | null
): string {
  if (!date) {
    return "is not enabled";
  }
  return `will be enabled at ${formatInLocalZone(date, eventZone, localZone)}`;
}
