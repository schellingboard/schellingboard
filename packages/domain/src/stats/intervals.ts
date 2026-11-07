export type Interval = { start: number; end: number };

export function mergeIntervals(list: readonly Interval[]): Interval[] {
  const sorted = list
    .filter((i) => i.end > i.start)
    .map((i) => ({ ...i }))
    .sort((a, b) => a.start - b.start);
  const merged: Interval[] = [];
  for (const next of sorted) {
    const last = merged[merged.length - 1];
    if (last && next.start <= last.end) last.end = Math.max(last.end, next.end);
    else merged.push(next);
  }
  return merged;
}

export function gapsWithin(
  window: Interval,
  list: readonly Interval[]
): Interval[] {
  const gaps: Interval[] = [];
  let cursor = window.start;
  for (const busy of mergeIntervals(list)) {
    if (busy.end <= window.start) continue;
    if (busy.start >= window.end) break;
    if (busy.start > cursor) gaps.push({ start: cursor, end: busy.start });
    cursor = Math.max(cursor, busy.end);
  }
  if (cursor < window.end) gaps.push({ start: cursor, end: window.end });
  return gaps;
}

export function utilization(
  window: Interval,
  list: readonly Interval[]
): number {
  const length = window.end - window.start;
  if (length <= 0) return 0;
  const free = gapsWithin(window, list).reduce(
    (sum, g) => sum + g.end - g.start,
    0
  );
  return 1 - free / length;
}

const overlaps = (a: Interval, b: Interval) =>
  a.start < b.end && b.start < a.end;

export function overlappingCounts(list: readonly Interval[]): number[] {
  return list.map(
    (a, i) => list.filter((b, j) => i !== j && overlaps(a, b)).length
  );
}

export function maxConcurrency(list: readonly Interval[]): number {
  const events = list
    .filter((i) => i.end > i.start)
    .flatMap((i) => [
      [i.start, 1],
      [i.end, -1],
    ]);
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let running = 0;
  let peak = 0;
  for (const [, delta] of events) {
    running += delta;
    peak = Math.max(peak, running);
  }
  return peak;
}

export function overlapPairs(list: readonly Interval[]): number {
  return overlappingCounts(list).reduce((sum, n) => sum + n, 0) / 2;
}

export function backToBackPairs(
  list: readonly Interval[],
  maxGap: number
): number {
  const sorted = [...list].sort((a, b) => a.start - b.start);
  let pairs = 0;
  let latestEnd = -Infinity;
  for (const next of sorted) {
    const gap = next.start - latestEnd;
    if (gap >= 0 && gap <= maxGap) pairs++;
    latestEnd = Math.max(latestEnd, next.end);
  }
  return pairs;
}

export function meanConcurrency(list: readonly Interval[]): number | null {
  const booked = mergeIntervals(list).reduce(
    (sum, i) => sum + i.end - i.start,
    0
  );
  if (booked === 0) return null;
  return (
    list.reduce((sum, i) => sum + Math.max(0, i.end - i.start), 0) / booked
  );
}
