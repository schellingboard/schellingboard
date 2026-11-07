import type { StatsTable } from "@schellingboard/contracts/stats";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";

const percent = (part: number, whole: number) =>
  whole === 0 ? null : Math.round((part / whole) * 1000) / 10;

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
  const offerers = only(facts.meetingOffererIds);
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
  return [headline, funnel];
}
