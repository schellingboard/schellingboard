import type { StatsTable } from "@schellingboard/contracts/stats";
import { median } from "@schellingboard/domain/stats/binning";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import {
  backToBackPairs,
  overlapPairs,
} from "@schellingboard/domain/stats/intervals";
import { pseudonymize } from "@schellingboard/domain/stats/pseudonyms";
import { DateTime } from "luxon";
import { col, percent, round } from "./cells";

const NONE = -1;
const MINUTE = 60_000;

interface Booked {
  start: number;
  end: number;
  day: string;
}

export function attendeeTables(
  facts: EventFacts,
  filter: StatsFilterInput
): StatsTable[] {
  const { sessions, people } = applyFilter(facts, filter);
  const zone = facts.timezone;
  const keptIds = new Set(sessions.map((s) => s.id));
  const timed = new Map<string, Booked>();
  for (const s of sessions) {
    if (!s.startTime || !s.endTime) continue;
    const start = DateTime.fromISO(s.startTime, { zone });
    timed.set(s.id, {
      start: start.toMillis(),
      end: DateTime.fromISO(s.endTime, { zone }).toMillis(),
      day: start.toISODate()!,
    });
  }

  const rsvpCount = new Map<string, number>();
  const booked = new Map<string, Booked[]>();
  for (const r of facts.rsvps) {
    if (!keptIds.has(r.sessionId) || !people.has(r.guestId)) continue;
    rsvpCount.set(r.guestId, (rsvpCount.get(r.guestId) ?? 0) + 1);
    const session = timed.get(r.sessionId);
    if (!session) continue;
    const list = booked.get(r.guestId);
    if (list) list.push(session);
    else booked.set(r.guestId, [session]);
  }

  const gaps: number[] = [];
  const perPerson = [...rsvpCount].map(([guestId, total]) => {
    const list = booked.get(guestId) ?? [];
    const sorted = [...list].sort((a, b) => a.start - b.start);
    const own: number[] = [];
    let latestEnd = -Infinity;
    let latestDay = "";
    for (const next of sorted) {
      if (next.day === latestDay) {
        const gap = (next.start - latestEnd) / MINUTE;
        if (gap >= 0) own.push(gap);
        latestEnd = Math.max(latestEnd, next.end);
      } else {
        latestDay = next.day;
        latestEnd = next.end;
      }
    }
    gaps.push(...own);
    const overlapping = overlapPairs(list);
    return {
      row: [
        total,
        new Set(list.map((b) => b.day)).size,
        round(
          list.reduce((sum, b) => sum + (b.end - b.start), 0) / (60 * MINUTE),
          2
        )!,
        backToBackPairs(list, facts.breakMinutes * MINUTE),
        overlapping,
        median(own) ?? NONE,
      ],
      overlapping,
    };
  });

  const table: StatsTable = {
    id: "attendees-table",
    title: "RSVPs per attendee",
    columns: [
      col("attendee", "Attendee", "text"),
      col("rsvps", "RSVPs", "integer"),
      col("days", "Days with RSVPs", "integer"),
      col("hours", "Hours booked", "number"),
      col("backToBack", "Back-to-back pairs", "integer"),
      col("overlapping", "Overlapping pairs", "integer"),
      col("medianGap", "Median gap", "minutes"),
    ],
    rows: pseudonymize(perPerson.map((p) => p.row)).map(
      ({ pseudonym, values }) => [
        pseudonym,
        ...values.slice(0, 5),
        values[5] === NONE ? null : values[5],
      ]
    ),
  };

  const steps: [string, number][] = [
    ["Back to back", 0],
    ["Up to the break", facts.breakMinutes],
    ["Up to 30 min", 30],
    ["Up to 1 h", 60],
    ["Up to 2 h", 120],
  ];
  const buckets: [string, number][] = [];
  for (const step of steps.sort((a, b) => a[1] - b[1]))
    if (buckets.length === 0 || step[1] > buckets[buckets.length - 1][1])
      buckets.push(step);
  buckets.push(["More than 2 h", Infinity]);
  const counts = buckets.map(() => 0);
  for (const gap of gaps) counts[buckets.findIndex(([, max]) => gap <= max)]++;
  const gapTable: StatsTable = {
    id: "attendees-gaps",
    title: "Gaps between RSVPed sessions",
    columns: [
      col("gap", "Gap", "text"),
      col("gaps", "Gaps", "integer"),
      col("share", "Share of gaps", "percent"),
    ],
    rows:
      gaps.length === 0
        ? []
        : buckets.map(([label], i) => [
            label,
            counts[i],
            percent(counts[i], gaps.length),
          ]),
  };

  const withRsvps = perPerson.length;
  const doubled = perPerson.filter((p) => p.overlapping > 0).length;
  const doubleBookings: StatsTable = {
    id: "attendees-double-bookings",
    title: "Double bookings",
    columns: [
      col("figure", "Figure", "text"),
      col("value", "People", "integer"),
      col("share", "Share", "percent"),
    ],
    rows:
      withRsvps === 0
        ? []
        : [
            ["People with RSVPs", withRsvps, 100],
            ["With overlapping RSVPs", doubled, percent(doubled, withRsvps)],
          ],
  };

  const hosts = new Set(sessions.flatMap((s) => s.hostIds));
  const sessionHosts = new Map(sessions.map((s) => [s.id, s.hostIds]));
  const attending = new Set(
    facts.rsvps
      .filter(
        (r) =>
          hosts.has(r.guestId) &&
          people.has(r.guestId) &&
          sessionHosts.has(r.sessionId) &&
          !sessionHosts.get(r.sessionId)!.includes(r.guestId)
      )
      .map((r) => r.guestId)
  );
  const hostCount = [...hosts].filter((h) => people.has(h)).length;
  const hostsTable: StatsTable = {
    id: "attendees-hosts",
    title: "Hosts who attend other sessions",
    columns: [
      col("figure", "Figure", "text"),
      col("value", "Hosts", "integer"),
      col("share", "Share", "percent"),
    ],
    rows:
      hostCount === 0
        ? []
        : [
            ["Hosts", hostCount, 100],
            [
              "With an RSVP to another session",
              attending.size,
              percent(attending.size, hostCount),
            ],
          ],
  };

  return [table, gapTable, doubleBookings, hostsTable];
}
