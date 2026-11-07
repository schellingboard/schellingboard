import type { StatsTable } from "@schellingboard/contracts/stats";
import { histogram, median } from "@schellingboard/domain/stats/binning";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import { TOO_FEW_TO_SAY } from "@schellingboard/domain/stats/correlation";
import {
  meanConcurrency,
  overlappingCounts,
} from "@schellingboard/domain/stats/intervals";
import {
  meanInterestShare,
  predictAttendance,
  rangeCovers,
  type Prediction,
} from "@schellingboard/domain/stats/attendance-prediction";
import {
  sessionOrigin,
  type SessionOrigin,
} from "@schellingboard/domain/stats/session-origin";
import { DateTime } from "luxon";
import {
  col,
  percent,
  round,
  tallyVotes,
  type Cell,
  type Column,
} from "./cells";

interface Row {
  id: string;
  title: string;
  origin: SessionOrigin;
  start: DateTime | null;
  end: DateTime | null;
  duration: number | null;
  locations: string[];
  locationIds: string[];
  hosts: string[];
  hostIds: string[];
  capacity: number;
  rsvps: number;
  reported: number | null;
  closed: boolean;
  parallel: number | null;
  interest: number | null;
  votes: number | null;
  proposalId: string | null;
  followUpSent: boolean;
  comments: number;
  share: number | null;
  voters: number;
  p50: Prediction | null;
  p80: Prediction | null;
}

function sessionRows(facts: EventFacts, filter: StatsFilterInput) {
  const { sessions, people } = applyFilter(facts, filter);
  const zone = facts.timezone;
  const rsvps = new Map<string, number>();
  for (const r of facts.rsvps)
    if (people.has(r.guestId))
      rsvps.set(r.sessionId, (rsvps.get(r.sessionId) ?? 0) + 1);
  const votes = tallyVotes(facts.votes.filter((v) => people.has(v.guestId)));
  const names = new Map(
    [...facts.hosts, ...facts.locations].map((x) => [x.id, x.name])
  );

  const parse = (iso: string | null) =>
    iso ? DateTime.fromISO(iso, { zone }) : null;
  const rows = sessions.map((s): Row => {
    const start = parse(s.startTime);
    const end = parse(s.endTime);
    const hostIds = s.hostIds.filter((id) => people.has(id));
    const tally = s.proposalId ? votes.get(s.proposalId) : undefined;
    return {
      id: s.id,
      title: s.title,
      origin: sessionOrigin(s),
      start,
      end,
      duration: start && end ? end.diff(start, "minutes").minutes : null,
      locations: s.locationIds.map((id) => names.get(id) ?? ""),
      locationIds: s.locationIds,
      hosts: hostIds.map((id) => names.get(id) ?? ""),
      hostIds,
      capacity: s.capacity,
      rsvps: rsvps.get(s.id) ?? 0,
      reported: s.attendeeCount,
      closed: s.closed,
      parallel: null,
      interest: tally ? percent(tally.interested, tally.total) : null,
      votes: tally?.total ?? (s.proposalId ? 0 : null),
      proposalId: s.proposalId,
      followUpSent: s.followUpSent,
      comments: s.commentCount,
      share: tally && tally.total > 0 ? tally.interested / tally.total : null,
      voters: tally?.total ?? 0,
      p50: null,
      p80: null,
    };
  });

  const timed = rows.filter((r) => r.start && r.end);
  const counts = overlappingCounts(
    timed.map((r) => ({ start: r.start!.toMillis(), end: r.end!.toMillis() }))
  );
  timed.forEach((r, i) => (r.parallel = counts[i]));
  const competing = facts.sessions.flatMap((s) => {
    const start = parse(s.startTime);
    const end = parse(s.endTime);
    return s.blocker || !start || !end
      ? []
      : [{ start: start.toMillis(), end: end.toMillis() }];
  });
  const meanParallel = meanConcurrency(competing);
  const shareByProposal = new Map<string, number>();
  for (const r of rows)
    if (r.proposalId && r.share !== null)
      shareByProposal.set(r.proposalId, r.share);
  if (meanParallel !== null && shareByProposal.size > 0) {
    const input = {
      attendees: people.size,
      parallel: meanParallel,
      meanShare: meanInterestShare([...shareByProposal.values()]),
    };
    for (const r of rows) {
      if (r.share === null) continue;
      const own = { ...input, share: r.share, voters: r.voters };
      r.p50 = predictAttendance(own, 0.5);
      r.p80 = predictAttendance(own, 0.8);
    }
  }
  rows.sort(
    (a, b) =>
      (a.start?.toMillis() ?? Infinity) - (b.start?.toMillis() ?? Infinity) ||
      a.title.localeCompare(b.title)
  );
  return { rows, people };
}

const present = (values: (number | null)[]) =>
  values.filter((v): v is number => v !== null);
const medianOf = (values: (number | null)[]) => round(median(present(values)));

function groupedTable(
  id: string,
  title: string,
  label: string,
  rows: Row[],
  keyOf: (row: Row) => string | null
): StatsTable {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = keyOf(row);
    if (key === null) continue;
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }
  return {
    id,
    title,
    columns: [
      col("group", label, "text"),
      col("sessions", "Sessions", "integer"),
      col("medianRsvps", "Median RSVPs", "number"),
      col("medianAttendees", "Median reported attendees", "number"),
      col("medianDuration", "Median duration", "minutes"),
    ],
    rows: [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, list]) => [
        key,
        list.length,
        medianOf(list.map((r) => r.rsvps)),
        medianOf(list.map((r) => r.reported)),
        medianOf(list.map((r) => r.duration)),
      ]),
  };
}

function binTable(
  id: string,
  title: string,
  label: string,
  type: Column["type"],
  edges: number[],
  rows: Row[],
  valueOf: (row: Row) => number | null
): StatsTable {
  const usable = rows.filter((r) => valueOf(r) !== null);
  const bins = histogram(
    usable.map((r) => valueOf(r)!),
    edges
  );
  return {
    id,
    title,
    columns: [
      col("from", `${label}, from`, type),
      col("to", `${label}, up to`, type),
      col("sessions", "Sessions", "integer"),
      col("medianRsvps", "Median RSVPs", "number"),
      col("medianAttendees", "Median reported attendees", "number"),
    ],
    rows: usable.length
      ? bins.map((bin) => {
          const inBin = usable.filter((r) => {
            const v = valueOf(r)!;
            return (
              v >= bin.from &&
              (v < bin.to ||
                (bin.to === edges[edges.length - 1] && v === bin.to))
            );
          });
          return [
            bin.from,
            bin.to,
            bin.count,
            medianOf(inBin.map((r) => r.rsvps)),
            medianOf(inBin.map((r) => r.reported)),
          ];
        })
      : [],
  };
}

const edgesTo = (steps: number[], max: number) =>
  max > steps[steps.length - 1] ? [...steps, max] : steps;

function reportsTable(
  rows: Row[],
  now: Date,
  anyReported: boolean
): StatsTable {
  // A report stays when its session is moved to a later time.
  const asked = rows.filter(
    (r) =>
      r.hostIds.length > 0 &&
      (r.reported !== null || (r.end && r.end.toMillis() < now.getTime()))
  );
  const line = (label: string, list: Row[]): Cell[] => [
    label,
    list.length,
    anyReported ? list.filter((r) => r.reported !== null).length : null,
    anyReported
      ? percent(list.filter((r) => r.reported !== null).length, list.length)
      : null,
  ];
  const origins = [...new Set(asked.map((r) => r.origin))].sort();
  const days = [...new Set(asked.map((r) => r.start?.toISODate() ?? ""))]
    .filter(Boolean)
    .sort();
  const hostIds = new Set(asked.flatMap((r) => r.hostIds));
  const reportingHosts = new Set(
    asked.filter((r) => r.reported !== null).flatMap((r) => r.hostIds)
  );
  return {
    id: "sessions-reports",
    title: "Did hosts report attendance?",
    columns: [
      col("group", "Group", "text"),
      col("asked", "Asked", "integer"),
      col("reported", "Reported", "integer"),
      col("share", "Share reported", "percent"),
    ],
    rows: asked.length
      ? [
          line("Sessions", asked),
          ...origins.map((o) =>
            line(
              `Sessions: ${o}`,
              asked.filter((r) => r.origin === o)
            )
          ),
          ...days.map((d) =>
            line(
              `Sessions: ${d}`,
              asked.filter((r) => r.start?.toISODate() === d)
            )
          ),
          line(
            "Follow-up reminder sent",
            asked.filter((r) => r.followUpSent)
          ),
          line(
            "No follow-up reminder",
            asked.filter((r) => !r.followUpSent)
          ),
          [
            "Hosts",
            hostIds.size,
            anyReported ? reportingHosts.size : null,
            anyReported ? percent(reportingHosts.size, hostIds.size) : null,
          ],
        ]
      : [],
  };
}

export function sessionTables(
  facts: EventFacts,
  filter: StatsFilterInput,
  now: Date
): StatsTable[] {
  const { rows, people } = sessionRows(facts, filter);
  const anyReported = rows.some((r) => r.reported !== null);
  const fmt = (d: DateTime | null) => d?.toFormat("yyyy-MM-dd HH:mm") ?? null;

  const table: StatsTable = {
    id: "sessions-table",
    title: "Sessions",
    columns: [
      col("title", "Title", "text"),
      col("origin", "Origin", "text"),
      col("day", "Day", "text"),
      col("start", "Start", "datetime"),
      col("end", "End", "datetime"),
      col("duration", "Duration", "minutes"),
      col("locations", "Locations", "text"),
      col("hosts", "Hosts", "text"),
      col("capacity", "Capacity", "integer"),
      col("rsvps", "RSVPs", "integer"),
      col("fill", "Fill", "percent"),
      col("reported", "Reported attendees", "integer"),
      col("perRsvp", "Attendees per RSVP", "number"),
      col("closed", "Closed", "boolean"),
      col("parallel", "Parallel sessions", "integer"),
      col("interest", "Proposal interest", "percent"),
      col("votes", "Proposal votes", "integer"),
      col("comments", "Comments", "integer"),
      col(
        "predicted",
        "Predicted attendance (model fitted on one event)",
        "number"
      ),
      col("low50", "Predicted, 50% range from", "number"),
      col("high50", "Predicted, 50% range to", "number"),
      col("low80", "Predicted, 80% range from", "number"),
      col("high80", "Predicted, 80% range to", "number"),
    ],
    rows: rows.map((r) => [
      r.title,
      r.origin,
      r.start?.toISODate() ?? null,
      fmt(r.start),
      fmt(r.end),
      r.duration,
      r.locations.join(", "),
      r.hosts.join(", "),
      r.capacity,
      r.rsvps,
      r.capacity > 0 ? percent(r.rsvps, r.capacity) : null,
      r.reported,
      r.reported !== null && r.rsvps > 0 ? round(r.reported / r.rsvps) : null,
      r.closed,
      r.parallel,
      r.interest,
      r.votes,
      r.comments,
      round(r.p50?.mid ?? null, 2),
      round(r.p50?.low ?? null, 2),
      round(r.p50?.high ?? null, 2),
      round(r.p80?.low ?? null, 2),
      round(r.p80?.high ?? null, 2),
    ]),
  };

  const hostedBy = new Map<string, number>();
  for (const r of rows)
    for (const h of r.hostIds) hostedBy.set(h, (hostedBy.get(h) ?? 0) + 1);
  const withHost = rows.filter((r) => r.hostIds.length > 0);
  const perHost = new Map<number, number>();
  for (const n of hostedBy.values()) perHost.set(n, (perHost.get(n) ?? 0) + 1);

  const hosts: StatsTable = {
    id: "sessions-hosts",
    title: "Hosts",
    columns: [col("figure", "Figure", "text"), col("value", "Value", "number")],
    rows: [
      ["Sessions with a host", withHost.length],
      ["Hosts", hostedBy.size],
      [
        "Share of members who hosted (%)",
        percent(
          [...hostedBy.keys()].filter((h) => people.has(h)).length,
          people.size
        ),
      ],
      [
        "Sessions with more than one host",
        rows.filter((r) => r.hostIds.length > 1).length,
      ],
    ],
  };
  const spread: StatsTable = {
    id: "sessions-per-host",
    title: "Sessions per host",
    columns: [
      col("sessions", "Sessions hosted", "text"),
      col("hosts", "Hosts", "integer"),
    ],
    rows: [...perHost.entries()]
      .sort(([a], [b]) => a - b)
      .map(([n, hostsCount]) => [String(n), hostsCount]),
  };

  const overLimit = (r: Row) => r.capacity > 0 && r.rsvps > r.capacity;
  const usedLocations = new Set(rows.flatMap((r) => r.locationIds));
  const capacity: StatsTable = {
    id: "sessions-capacity",
    title: "Capacity by location",
    columns: [
      col("location", "Location", "text"),
      col("sessions", "Sessions", "integer"),
      col("limited", "Sessions with a capacity", "integer"),
      col("over", "Sessions over capacity", "integer"),
    ],
    rows: facts.locations
      .filter(
        (l) =>
          usedLocations.has(l.id) && !filter.excludeLocations.includes(l.id)
      )
      .map((l) => {
        const here = rows.filter((r) => r.locationIds.includes(l.id));
        return [
          l.name,
          here.length,
          here.filter((r) => r.capacity > 0).length,
          here.filter(overLimit).length,
        ];
      }),
  };

  const closed = groupedTable(
    "sessions-closed",
    "Closed sessions",
    "Kind",
    rows,
    (r) => (r.closed ? "Closed" : "Open")
  );

  const reportedRows = rows.filter((r) => r.reported !== null && r.rsvps > 0);
  const ratio = binTable(
    "sessions-attendance-ratio",
    "Attendees per RSVP",
    "Attendees per RSVP",
    "number",
    edgesTo(
      [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5],
      Math.ceil(Math.max(0, ...reportedRows.map((r) => r.reported! / r.rsvps)))
    ),
    reportedRows,
    (r) => r.reported! / r.rsvps
  );

  const compared = rows.filter((r) => r.reported !== null && r.p50 && r.p80);
  const calibrate = (label: string, expected: number, key: "p50" | "p80") => {
    const inside = compared.filter((r) =>
      rangeCovers(r[key]!, { min: r.reported!, max: r.reported! })
    ).length;
    return [
      label,
      compared.length,
      inside,
      percent(inside, compared.length),
      expected,
      compared.length < TOO_FEW_TO_SAY ? "too few to say" : null,
    ];
  };
  const calibration: StatsTable = {
    id: "sessions-calibration",
    title:
      "Predicted attendance: how often the report falls in the range (model fitted on one event, n = 13)",
    columns: [
      col("range", "Range", "text"),
      col("compared", "Sessions compared", "integer"),
      col("inside", "Reports inside", "integer"),
      col("share", "Share inside", "percent"),
      col("expected", "Expected share", "percent"),
      col("note", "Note", "text"),
    ],
    rows: compared.length
      ? [calibrate("50% range", 50, "p50"), calibrate("80% range", 80, "p80")]
      : [],
  };

  return [
    table,
    calibration,
    groupedTable(
      "sessions-origins",
      "Session origins",
      "Origin",
      rows,
      (r) => r.origin
    ),
    hosts,
    spread,
    reportsTable(rows, now, anyReported),
    ratio,
    binTable(
      "sessions-duration",
      "Session duration",
      "Duration (min)",
      "minutes",
      edgesTo(
        [0, 30, 60, 90, 120, 180, 240],
        Math.ceil(Math.max(0, ...present(rows.map((r) => r.duration))))
      ),
      rows,
      (r) => r.duration
    ),
    groupedTable(
      "sessions-by-hour",
      "Sessions by start hour",
      "Start hour",
      rows,
      (r) => r.start?.toFormat("HH:00") ?? null
    ),
    groupedTable(
      "sessions-by-day",
      "Sessions by day",
      "Day",
      rows,
      (r) => r.start?.toISODate() ?? null
    ),
    closed,
    capacity,
  ];
}
