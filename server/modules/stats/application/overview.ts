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
    title: "Headline numbers",
    columns: [
      { key: "figure", label: "Figure", type: "text" },
      { key: "value", label: "Value", type: "integer" },
    ],
    rows: [
      ["Members", people.size],
      ["Active members", active.size],
      ["Voters", voters.size],
      ["People with RSVPs", rsvpers.size],
      ["Proposals", proposals.length],
      ["Sessions", sessions.length],
      ["Hosts", hosts.size],
      ["Sessions with an attendee report", reported === 0 ? null : reported],
    ],
  };

  const steps: [string, number][] = [
    ["Members", people.size],
    ["Active", active.size],
    ["Voted", voters.size],
    ["RSVPed", rsvpers.size],
    ["Hosted", hosts.size],
  ];
  const funnel: StatsTable = {
    id: "overview-funnel",
    title: "Participation funnel",
    columns: [
      { key: "step", label: "Step", type: "text" },
      { key: "members", label: "Members", type: "integer" },
      { key: "share", label: "Share of members (%)", type: "percent" },
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
    title: "Who did what",
    columns: [
      { key: "group", label: "Group", type: "text" },
      { key: "members", label: "Members", type: "integer" },
      { key: "share", label: "Share of members (%)", type: "percent" },
      { key: "meanRsvps", label: "Mean RSVPs per member", type: "number" },
    ],
    rows: [
      group(
        "Voted only",
        members.filter((id) => voted(id) && !rsvped(id))
      ),
      group(
        "RSVPed only",
        members.filter((id) => !voted(id) && rsvped(id))
      ),
      group(
        "Voted and RSVPed",
        members.filter((id) => voted(id) && rsvped(id))
      ),
      group(
        "Neither",
        members.filter((id) => !voted(id) && !rsvped(id))
      ),
      group("All voters", members.filter(voted)),
      group(
        "All other members",
        members.filter((id) => !voted(id))
      ),
    ],
  };
  return [headline, funnel, whoDidWhat];
}
