import type { StatsTable } from "@schellingboard/contracts/stats";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";

import { percent, round } from "./cells";

export function overviewTables(
  facts: EventFacts,
  filter: StatsFilterInput
): StatsTable[] {
  const { sessions, proposals, people } = applyFilter(facts, filter);
  const keptSessions = new Set(sessions.map((s) => s.id));
  const only = (ids: Iterable<string>) =>
    new Set([...ids].filter((id) => people.has(id)));

  const voters = only(facts.votes.map((v) => v.guestId));
  const rsvpers = only(
    facts.rsvps
      .filter((r) => keptSessions.has(r.sessionId))
      .map((r) => r.guestId)
  );
  const proposers = only(proposals.flatMap((p) => p.hostIds));
  const hosts = only(sessions.flatMap((s) => s.hostIds));
  const commenters = only(facts.commenterIds);
  const offerers = only(facts.meetingSlotCounts.map((c) => c.guestId));
  const active = new Set(
    [voters, rsvpers, proposers, hosts, commenters, offerers].flatMap((set) => [
      ...set,
    ])
  );
  const reported = sessions.filter((s) => s.attendeeCount !== null).length;

  const headline: StatsTable = {
    id: "overview-headline",
    titleId: "headlineNumbers",
    columns: [
      { key: "figure", labelId: "figure", type: "label" },
      { key: "value", labelId: "value", type: "integer" },
    ],
    rows: [
      ["members", people.size],
      ["activeMembers", active.size],
      ["voters", voters.size],
      ["peopleWithRsvps", rsvpers.size],
      ["proposals", proposals.length],
      ["sessions", sessions.length],
      ["hosts", hosts.size],
      ["sessionsWithAnAttendeeReport", reported === 0 ? null : reported],
    ],
  };

  const steps: [string, number][] = [
    ["members", people.size],
    ["active", active.size],
    ["voted", voters.size],
    ["rsvped", rsvpers.size],
    ["hosted", hosts.size],
  ];
  const funnel: StatsTable = {
    id: "overview-funnel",
    titleId: "participationFunnel",
    columns: [
      { key: "step", labelId: "step", type: "label" },
      { key: "members", labelId: "members", type: "integer" },
      { key: "share", labelId: "shareOfMembersPercent", type: "percent" },
    ],
    rows: steps.map(([label, count]) => [
      label,
      count,
      percent(count, people.size),
    ]),
  };

  const rsvpCounts = new Map<string, number>();
  for (const r of facts.rsvps)
    if (keptSessions.has(r.sessionId) && people.has(r.guestId))
      rsvpCounts.set(r.guestId, (rsvpCounts.get(r.guestId) ?? 0) + 1);
  const members = [...people];
  const mean = (ids: string[]) =>
    ids.length === 0
      ? null
      : round(
          ids.reduce((sum, id) => sum + (rsvpCounts.get(id) ?? 0), 0) /
            ids.length,
          2
        );
  const group = (label: string, ids: string[]) => [
    label,
    ids.length,
    percent(ids.length, people.size),
    mean(ids),
  ];
  const voted = (id: string) => voters.has(id);
  const rsvped = (id: string) => rsvpers.has(id);
  const whoDidWhat: StatsTable = {
    id: "overview-who-did-what",
    titleId: "whoDidWhat",
    columns: [
      { key: "group", labelId: "group", type: "label" },
      { key: "members", labelId: "members", type: "integer" },
      { key: "share", labelId: "shareOfMembersPercent", type: "percent" },
      { key: "meanRsvps", labelId: "meanRsvpsPerMember", type: "number" },
    ],
    rows: [
      group(
        "votedOnly",
        members.filter((id) => voted(id) && !rsvped(id))
      ),
      group(
        "rsvpedOnly",
        members.filter((id) => !voted(id) && rsvped(id))
      ),
      group(
        "votedAndRsvped",
        members.filter((id) => voted(id) && rsvped(id))
      ),
      group(
        "neither",
        members.filter((id) => !voted(id) && !rsvped(id))
      ),
      group("allVoters", members.filter(voted)),
      group(
        "allOtherMembers",
        members.filter((id) => !voted(id))
      ),
    ],
  };
  return [headline, funnel, whoDidWhat];
}
