const MS_PER_MINUTE = 60 * 1000;

/** Rendered height of one slot row in the schedule grid. */
export const SLOT_HEIGHT_PX = 44;

/** Vertical pixel offset of `at` from the top of a day's slot grid. */
export function gridOffsetPx(
  dayStart: Date,
  at: Date,
  incrementMinutes: number
): number {
  const offsetMs = at.getTime() - dayStart.getTime();
  return (offsetMs / (incrementMinutes * MS_PER_MINUTE)) * SLOT_HEIGHT_PX;
}

// The break has no upper bound and can swallow a whole block; this keeps it
// there to hover and click, grown upwards so it never covers what follows.
const MIN_BLOCK_PX = 8;

/** Where a block running from `from` to `to` sits on a day's slot grid. */
export function gridBlockPx(
  dayStart: Date,
  from: Date,
  to: Date,
  incrementMinutes: number
): { topPx: number; heightPx: number } {
  const offset = (at: Date) =>
    Math.round(gridOffsetPx(dayStart, at, incrementMinutes));
  const bottom = offset(to);
  const topPx = Math.max(0, Math.min(offset(from), bottom - MIN_BLOCK_PX));
  return { topPx, heightPx: bottom - topPx };
}

/**
 * Vertical pixel offset of `now` from the top of a day's slot grid (the
 * now-line), or null when `now` falls outside [start, end).
 */
export function getNowOffsetPx(
  day: { start: Date; end: Date },
  now: Date,
  incrementMinutes: number
): number | null {
  if (now < day.start || now >= day.end) return null;
  return gridOffsetPx(day.start, now, incrementMinutes);
}
