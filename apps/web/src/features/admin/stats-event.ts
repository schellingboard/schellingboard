type Dated = { firstDayStart: string | null };

const start = (event: Dated) =>
  event.firstDayStart ? Date.parse(event.firstDayStart) : NaN;

/** The event running or run last; before any has started, the next one. */
export function defaultStatsEvent<T extends Dated>(
  events: T[],
  now: Date
): T | undefined {
  const dated = events.filter((e) => !Number.isNaN(start(e)));
  const started = dated
    .filter((e) => start(e) <= now.getTime())
    .sort((a, b) => start(b) - start(a));
  const upcoming = dated.sort((a, b) => start(a) - start(b));
  return started[0] ?? upcoming[0] ?? events[0];
}
