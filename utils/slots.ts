// Slot math for the schedule grid. Each event divides its days into slots of
// `slotIncrementMinutes`; the grid, start-time options, and duration options
// all derive from these helpers so they stay in agreement. 1-on-1 meeting
// slots share this grid and its increment; utils/meeting-slots.ts derives
// those from a day.

export const SLOT_INCREMENT_OPTIONS = [15, 30, 45, 60] as const;

/**
 * Default per-event slot increment, used when an event's value is unavailable
 * (e.g. before context has loaded). Mirrors the events schema default.
 */
export const DEFAULT_SLOT_INCREMENT_MINUTES = 30;

const MS_PER_MINUTE = 60 * 1000;

/** Rendered height of one slot row in the schedule grid. */
export const SLOT_HEIGHT_PX = 44;

export function isValidSlotIncrement(minutes: number): boolean {
  return SLOT_INCREMENT_OPTIONS.some((opt) => opt === minutes);
}

/**
 * Number of slots in [start, end). Rounds up so a misaligned window (legacy
 * data) still renders every session instead of truncating the grid.
 */
export function getNumSlots(
  start: Date,
  end: Date,
  incrementMinutes: number
): number {
  const lengthMs = end.getTime() - start.getTime();
  return Math.ceil(lengthMs / MS_PER_MINUTE / incrementMinutes);
}

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

/** True when `date` sits a whole number of slots away from `anchor`. */
export function isSlotAligned(
  date: Date,
  anchor: Date,
  incrementMinutes: number
): boolean {
  const offsetMs = date.getTime() - anchor.getTime();
  return offsetMs % (incrementMinutes * MS_PER_MINUTE) === 0;
}

/**
 * Selectable session durations: whole multiples of the increment up to
 * maxDuration. Always offers at least one slot, even when maxDuration is
 * misconfigured below the increment.
 */
export function slotDurationOptions(
  incrementMinutes: number,
  maxDuration: number
): number[] {
  const count = Math.max(1, Math.floor(maxDuration / incrementMinutes));
  return Array.from({ length: count }, (_, i) => (i + 1) * incrementMinutes);
}

/**
 * The durations a session booked from a slot `slotOffsetMinutes` past the
 * grid may run: each ends on the grid, after the slot's break is over. An
 * organizer's breakless session keeps a slot off the grid.
 */
export function gridEndingDurations(opts: {
  slotOffsetMinutes: number;
  incrementMinutes: number;
  maxDuration: number;
  breakMinutes: number;
}): number[] {
  const { slotOffsetMinutes, incrementMinutes, maxDuration, breakMinutes } =
    opts;
  if (slotOffsetMinutes === 0) {
    return slotDurationOptions(incrementMinutes, maxDuration);
  }
  return slotDurationOptions(incrementMinutes, maxDuration + slotOffsetMinutes)
    .map((d) => d - slotOffsetMinutes)
    .filter((d) => d > breakMinutes && d <= maxDuration);
}

/**
 * Why a self-booked session is too long, or null. The form only offers the
 * durations above, so anything longer is a hand-crafted payload claiming more
 * of a room than the event allows.
 *
 * An interval of invalid dates compares false here and passes, so callers must
 * have rejected those already — `sessionBookingWindowError` runs first and does.
 */
export function sessionDurationError(
  start: Date,
  end: Date,
  incrementMinutes: number,
  maxSessionDuration: number
): string | null {
  const options = slotDurationOptions(incrementMinutes, maxSessionDuration);
  const longest = options[options.length - 1];
  const minutes = (end.getTime() - start.getTime()) / MS_PER_MINUTE;
  return minutes > longest
    ? `Sessions can last at most ${longest} minutes`
    : null;
}

/**
 * Snap a free-form duration (e.g. from a proposal) to the nearest selectable
 * option. Ties round up so the session gets at least the proposed time.
 */
export function snapDurationToSlots(
  duration: number,
  incrementMinutes: number,
  maxDuration: number
): number {
  const options = slotDurationOptions(incrementMinutes, maxDuration);
  let best = options[0];
  for (const option of options) {
    if (Math.abs(option - duration) <= Math.abs(best - duration)) {
      best = option;
    }
  }
  return best;
}
