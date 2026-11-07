import type { StatsTable } from "@schellingboard/contracts/stats";
import { median } from "@schellingboard/domain/stats/binning";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import {
  gapsWithin,
  mergeIntervals,
  type Interval,
} from "@schellingboard/domain/stats/intervals";
import { DateTime } from "luxon";
import { col, percent, round } from "./cells";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const length = (list: readonly Interval[]) =>
  list.reduce((sum, i) => sum + i.end - i.start, 0);

const COLUMNS = [
  col("location", "Location", "text"),
  col("sessions", "Sessions", "integer"),
  col("bookedHours", "Booked hours", "number"),
  col("availableHours", "Available hours", "number"),
  col("utilization", "Utilization", "percent"),
  col("gaps", "Gaps", "integer"),
  col("fragments", "Unusable fragments", "integer"),
  col("gapMinutes", "Total gap time", "minutes"),
  col("longestGap", "Longest gap", "minutes"),
  col("capacity", "Capacity", "integer"),
  col("bookable", "Bookable", "boolean"),
  col("medianRsvps", "Median RSVPs", "number"),
  col("over", "Sessions over capacity", "integer"),
];

export function locationTables(
  facts: EventFacts,
  filter: StatsFilterInput
): StatsTable[] {
  const { sessions, people } = applyFilter(facts, filter);
  const zone = facts.timezone;
  const ms = (iso: string) => DateTime.fromISO(iso, { zone }).toMillis();
  const windows = facts.days
    .map((d) => ({ start: ms(d.startBookings), end: ms(d.endBookings) }))
    .filter((w) => w.end > w.start)
    .sort((a, b) => a.start - b.start);
  const kept = facts.locations.filter(
    (l) => !filter.excludeLocations.includes(l.id)
  );
  const details = new Map(facts.locationDetails.map((l) => [l.id, l]));

  const rsvps = new Map<string, number>();
  for (const r of facts.rsvps)
    if (people.has(r.guestId))
      rsvps.set(r.sessionId, (rsvps.get(r.sessionId) ?? 0) + 1);

  const interval = (s: { startTime: string | null; endTime: string | null }) =>
    s.startTime && s.endTime
      ? [{ start: ms(s.startTime), end: ms(s.endTime) }]
      : [];
  const busy = new Map(
    kept.map((l) => [
      l.id,
      mergeIntervals(
        facts.sessions
          .filter((s) => s.locationIds.includes(l.id))
          .flatMap(interval)
      ),
    ])
  );
  const unavailable = new Map(
    kept.map((l) => [
      l.id,
      facts.unavailability
        .filter((u) => u.locationId === l.id)
        .map((u) => ({ start: ms(u.start), end: ms(u.end) })),
    ])
  );
  const availableIn = (window: Interval, locationId: string) =>
    gapsWithin(window, unavailable.get(locationId) ?? []);

  // A session booked from grid slot S starts at S + break, so a gap is usable
  // when some slot S >= gapStart - break fits a whole increment before gapEnd.
  const increment = facts.slotIncrementMinutes * MINUTE;
  const lead = facts.breakMinutes * MINUTE;
  const usable = (gap: Interval, window: Interval) => {
    const first = Math.max(
      window.start,
      window.start +
        Math.ceil((gap.start - lead - window.start) / increment) * increment
    );
    return first + increment <= gap.end;
  };

  const rows = kept.map((l) => {
    const here = sessions.filter((s) => s.locationIds.includes(l.id));
    const counts = here.map((s) => rsvps.get(s.id) ?? 0);
    const detail = details.get(l.id);
    const figures: Record<string, string | number | boolean | null> = {
      location: l.name,
      sessions: here.length,
      bookedHours: null,
      availableHours: null,
      utilization: null,
      gaps: null,
      fragments: null,
      gapMinutes: null,
      longestGap: null,
      capacity: detail?.capacity ?? 0,
      bookable: detail?.bookable ?? false,
      medianRsvps: round(median(counts)),
      over: here.filter((s, i) => s.capacity > 0 && counts[i] > s.capacity)
        .length,
    };
    if (windows.length > 0) {
      const found = windows.flatMap((w) =>
        availableIn(w, l.id).flatMap((seg) =>
          gapsWithin(seg, busy.get(l.id) ?? []).map((gap) => ({
            gap,
            usable: usable(gap, w),
          }))
        )
      );
      const available = length(windows.flatMap((w) => availableIn(w, l.id)));
      const free = length(found.map((f) => f.gap));
      Object.assign(figures, {
        bookedHours: round((available - free) / HOUR, 2),
        availableHours: round(available / HOUR, 2),
        utilization: percent(available - free, available),
        gaps: found.filter((f) => f.usable).length,
        fragments: found.filter((f) => !f.usable).length,
        gapMinutes: round(free / MINUTE),
        longestGap: found.length
          ? Math.max(...found.map((f) => f.gap.end - f.gap.start)) / MINUTE
          : null,
      });
    }
    return COLUMNS.map((c) => figures[c.key]);
  });

  const table: StatsTable = {
    id: "locations-table",
    title: "Locations",
    columns: COLUMNS,
    rows,
  };

  const heat: (string | number | null)[][] = [];
  const supply: (string | number)[][] = [];
  const timed = sessions.flatMap((s) =>
    interval(s).map((i) => ({ ...i, rsvps: rsvps.get(s.id) ?? 0 }))
  );
  for (const w of windows) {
    const day = DateTime.fromMillis(w.start, { zone }).toISODate()!;
    const seen = new Set<string>();
    for (
      let h = DateTime.fromMillis(w.start, { zone }).startOf("hour");
      h.toMillis() < w.end;
      h = h.plus({ hours: 1 })
    ) {
      const slot = {
        start: Math.max(h.toMillis(), w.start),
        end: Math.min(h.plus({ hours: 1 }).toMillis(), w.end),
      };
      const label = h.toFormat("HH:00");
      const hour = seen.has(label) ? `${label} (again)` : label;
      seen.add(label);
      for (const l of kept) {
        const open = availableIn(slot, l.id);
        const openMs = length(open);
        if (openMs === 0) continue;
        const free = length(
          open.flatMap((seg) => gapsWithin(seg, busy.get(l.id) ?? []))
        );
        heat.push([day, l.name, hour, percent(openMs - free, openMs)]);
      }
      const overlap = (i: Interval) =>
        Math.max(0, Math.min(i.end, slot.end) - Math.max(i.start, slot.start)) /
        (slot.end - slot.start);
      supply.push([
        day,
        hour,
        round(
          timed.reduce((sum, t) => sum + overlap(t), 0),
          2
        )!,
        round(
          timed.reduce((sum, t) => sum + overlap(t) * t.rsvps, 0),
          2
        )!,
      ]);
    }
  }

  return [
    table,
    {
      id: "locations-heatmap",
      title: "Utilization by hour",
      columns: [
        col("day", "Day", "text"),
        col("location", "Location", "text"),
        col("hour", "Hour", "text"),
        col("booked", "Booked share of the open time", "percent"),
      ],
      rows: heat,
    },
    {
      id: "locations-supply-demand",
      title: "Parallel sessions and RSVPs by hour",
      columns: [
        col("day", "Day", "text"),
        col("hour", "Hour", "text"),
        col("sessions", "Sessions running (average)", "number"),
        col("rsvps", "RSVPs to running sessions (average)", "number"),
      ],
      rows: supply,
    },
  ];
}
