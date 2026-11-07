import type { StatsTable } from "@schellingboard/contracts/stats";
import { quantile } from "@schellingboard/domain/stats/binning";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import { pseudonymize } from "@schellingboard/domain/stats/pseudonyms";
import { DateTime } from "luxon";
import { col, percent, round, tallyVotes, type Cell } from "./cells";

const QUARTERS = [
  "Top quarter",
  "Second quarter",
  "Third quarter",
  "Bottom quarter",
];
const DAY_MS = 86_400_000;

export function proposalTables(
  facts: EventFacts,
  filter: StatsFilterInput
): StatsTable[] {
  const { sessions, proposals, people } = applyFilter(facts, filter);
  const zone = facts.timezone;
  const names = new Map(facts.proposalHosts.map((h) => [h.id, h.name]));
  const kept = new Set(proposals.map((p) => p.id));
  const votes = facts.votes.filter(
    (v) => kept.has(v.proposalId) && people.has(v.guestId)
  );
  const tally = tallyVotes(votes);
  const scheduled = new Set(
    facts.sessions
      .filter((s) => !s.blocker && s.proposalId)
      .map((s) => s.proposalId)
  );
  const rsvpCount = new Map<string, number>();
  for (const r of facts.rsvps)
    if (people.has(r.guestId))
      rsvpCount.set(r.sessionId, (rsvpCount.get(r.sessionId) ?? 0) + 1);
  const keptSession = new Map(
    sessions.flatMap((s) => (s.proposalId ? [[s.proposalId, s] as const] : []))
  );

  const firstCreated = Math.min(
    ...proposals.map((p) => DateTime.fromISO(p.createdTime).toMillis())
  );
  const base = proposals
    .map((p) => {
      const t = tally.get(p.id) ?? {
        interested: 0,
        maybe: 0,
        skip: 0,
        total: 0,
      };
      const voters = t.total;
      const created = DateTime.fromISO(p.createdTime, { zone });
      const session = keptSession.get(p.id);
      return {
        p,
        ...t,
        voters,
        created,
        hosts: p.hostIds
          .filter((id) => people.has(id))
          .map((id) => names.get(id) ?? ""),
        hasSession: scheduled.has(p.id),
        rsvps: session ? (rsvpCount.get(session.id) ?? 0) : null,
        reported: session?.attendeeCount ?? null,
      };
    })
    .sort(
      (a, b) =>
        a.created.toMillis() - b.created.toMillis() ||
        a.p.title.localeCompare(b.p.title)
    );
  const rankOf = (interested: number) =>
    1 + base.filter((b) => b.interested > interested).length;

  const table: StatsTable = {
    id: "proposals-table",
    title: "Proposals",
    columns: [
      col("title", "Title", "text"),
      col("hosts", "Hosts", "text"),
      col("created", "Created", "datetime"),
      col("daysIn", "Days after the first proposal", "number"),
      col("duration", "Duration", "minutes"),
      col("cohost", "Co-host wanted", "boolean"),
      col("interested", "Interested", "integer"),
      col("maybe", "Maybe", "integer"),
      col("skip", "Skip", "integer"),
      col("voters", "Voters", "integer"),
      col("interest", "Interest share", "percent"),
      col("rank", "Rank", "integer"),
      col("session", "Became a session", "boolean"),
      col("rsvps", "Session RSVPs", "integer"),
      col("reported", "Reported attendees", "integer"),
      col("comments", "Comments", "integer"),
    ],
    rows: base.map((b) => [
      b.p.title,
      b.hosts.join(", "),
      b.created.toFormat("yyyy-MM-dd HH:mm"),
      round((b.created.toMillis() - firstCreated) / DAY_MS),
      b.p.durationMinutes,
      b.p.cohostWanted,
      b.interested,
      b.maybe,
      b.skip,
      b.voters,
      percent(b.interested, b.voters),
      rankOf(b.interested),
      b.hasSession,
      b.rsvps,
      b.reported,
      b.p.commentCount,
    ]),
  };

  const threshold = quantile(
    base.map((b) => b.interested),
    0.75
  );
  const unscheduled: StatsTable = {
    id: "proposals-unscheduled",
    title: "Popular but never scheduled",
    columns: [
      col("title", "Title", "text"),
      col("hosts", "Hosts", "text"),
      col("interested", "Interested", "integer"),
      col("voters", "Voters", "integer"),
      col("interest", "Interest share", "percent"),
    ],
    rows: base
      .filter(
        (b) =>
          threshold !== null &&
          b.interested > 0 &&
          b.interested >= threshold &&
          !b.hasSession
      )
      .sort((a, b) => b.interested - a.interested)
      .map((b) => [
        b.p.title,
        b.hosts.join(", "),
        b.interested,
        b.voters,
        percent(b.interested, b.voters),
      ]),
  };

  const perDay = new Map<string, number>();
  for (const b of base) {
    const day = b.created.toISODate()!;
    perDay.set(day, (perDay.get(day) ?? 0) + 1);
  }
  const days: [string, number][] = [];
  if (base.length > 0) {
    const last = base[base.length - 1].created.startOf("day");
    for (
      let d = base[0].created.startOf("day");
      d <= last;
      d = d.plus({ days: 1 })
    )
      days.push([d.toISODate()!, perDay.get(d.toISODate()!) ?? 0]);
  }
  const overTime: StatsTable = {
    id: "proposals-over-time",
    title: "Proposals over time",
    columns: [
      col("day", "Day", "text"),
      col("proposals", "Proposals created", "integer"),
    ],
    rows: days,
  };

  const perVoter = new Map<string, number[]>();
  for (const v of votes) {
    const c = perVoter.get(v.guestId) ?? [0, 0, 0, 0];
    c[0]++;
    c[v.choice === "interested" ? 1 : v.choice === "maybe" ? 2 : 3]++;
    perVoter.set(v.guestId, c);
  }
  const voters: StatsTable = {
    id: "proposals-voters",
    title: "Votes per voter",
    columns: [
      col("voter", "Voter", "text"),
      col("total", "Votes", "integer"),
      col("interested", "Interested", "integer"),
      col("maybe", "Maybe", "integer"),
      col("skip", "Skip", "integer"),
      col("coverage", "Share of proposals voted on", "percent"),
      col("interestedShare", "Share interested", "percent"),
    ],
    rows: pseudonymize([...perVoter.values()]).map(({ pseudonym, values }) => [
      pseudonym,
      ...values,
      percent(values[0], proposals.length),
      percent(values[1], values[0]),
    ]),
  };

  const voterCount = perVoter.size;
  const everything = [...perVoter.values()].filter(
    (c) => c[0] === proposals.length
  ).length;
  const sum = (i: number) =>
    [...perVoter.values()].reduce((s, c) => s + c[i], 0);
  const mix: StatsTable = {
    id: "proposals-choice-mix",
    title: "Choice mix",
    columns: [
      col("figure", "Figure", "text"),
      col("value", "Value", "integer"),
      col("share", "Share", "percent"),
    ],
    rows:
      votes.length === 0
        ? []
        : [
            ["Interested", sum(1), percent(sum(1), votes.length)],
            ["Maybe", sum(2), percent(sum(2), votes.length)],
            ["Skip", sum(3), percent(sum(3), votes.length)],
            [
              "Voters who voted on every proposal",
              everything,
              percent(everything, voterCount),
            ],
          ],
  };

  const hostedBy = new Map<string, number>();
  for (const b of base)
    for (const id of b.p.hostIds)
      if (people.has(id)) hostedBy.set(id, (hostedBy.get(id) ?? 0) + 1);
  const spread = new Map<number, number>();
  for (const n of hostedBy.values()) spread.set(n, (spread.get(n) ?? 0) + 1);
  const hostsTable: StatsTable = {
    id: "proposals-hosts",
    title: "Hosts and proposals",
    columns: [
      col("figure", "Figure", "text"),
      col("value", "Value", "integer"),
    ],
    rows: [
      ["Hosts", hostedBy.size],
      [
        "Proposals with more than one host",
        base.filter((b) => b.hosts.length > 1).length,
      ],
      [
        "Proposals wanting a co-host",
        base.filter((b) => b.p.cohostWanted).length,
      ],
      [
        "Co-host wanted and found",
        base.filter((b) => b.p.cohostWanted && b.hosts.length > 1).length,
      ],
    ],
  };
  const perHost: StatsTable = {
    id: "proposals-per-host",
    title: "Proposals per host",
    columns: [
      col("proposals", "Proposals hosted", "text"),
      col("hosts", "Hosts", "integer"),
    ],
    rows: [...spread.entries()]
      .sort(([a], [b]) => a - b)
      .map(([n, count]) => [String(n), count]),
  };

  const ranked = [...base].sort(
    (a, b) => b.interested - a.interested || a.p.title.localeCompare(b.p.title)
  );
  const quarters = QUARTERS.map((label, q) => {
    const group = ranked.filter(
      (_, i) => Math.floor((i * 4) / ranked.length) === q
    );
    const became = group.filter((b) => b.hasSession).length;
    return [
      label,
      group.length,
      became,
      percent(became, group.length),
    ] as Cell[];
  }).filter((row) => row[1] !== 0);
  const conversion: StatsTable = {
    id: "proposals-conversion",
    title: "Conversion to sessions by interest",
    columns: [
      col("group", "Proposals by interested votes", "text"),
      col("proposals", "Proposals", "integer"),
      col("sessions", "Became a session", "integer"),
      col("share", "Share", "percent"),
    ],
    rows: quarters,
  };

  return [
    table,
    unscheduled,
    overTime,
    voters,
    mix,
    hostsTable,
    perHost,
    conversion,
  ];
}
