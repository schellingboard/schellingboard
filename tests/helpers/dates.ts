// Relative to the run, never a fixed date: a hard-coded one slips into the past
// and the tests that need a bookable slot, or a phase that is on, start failing.
export function isoDay(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
