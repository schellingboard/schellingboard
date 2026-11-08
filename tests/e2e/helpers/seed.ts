import { DateTime } from "luxon";

/**
 * Midnight Berlin on Conference Gamma's day `day` (0-based). The seed lays
 * Gamma out from the instant global setup ran it, not from when a test runs:
 * a suite crossing Berlin midnight would otherwise look one day too late.
 */
export function gammaDay(day: number): DateTime {
  const seededAt = process.env.E2E_SEEDED_AT;
  return (seededAt ? DateTime.fromISO(seededAt) : DateTime.now())
    .setZone("Europe/Berlin")
    .plus({ days: 14 + day })
    .startOf("day");
}
