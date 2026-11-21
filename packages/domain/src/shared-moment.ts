import type { SharedMoment } from "./event";

/** The earliest moment a session from `start` to `end` runs into, if any. */
export function overlappingMoment(
  moments: SharedMoment[],
  start: Date,
  end: Date
): SharedMoment | undefined {
  return moments
    .filter(
      (m) =>
        m.start.getTime() < end.getTime() && start.getTime() < m.end.getTime()
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
}
