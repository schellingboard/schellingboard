import type { StatsTable } from "@schellingboard/contracts/stats";

export type Column = StatsTable["columns"][number];
export type Cell = StatsTable["rows"][number][number];

export const col = (
  key: string,
  label: string,
  type: Column["type"]
): Column => ({
  key,
  label,
  type,
});

export const round = (value: number | null, places = 1) =>
  value === null ? null : Math.round(value * 10 ** places) / 10 ** places;
export const percent = (part: number, whole: number) =>
  whole === 0 ? null : round((part / whole) * 100);

export interface VoteTally {
  interested: number;
  maybe: number;
  skip: number;
  total: number;
}

export function tallyVotes(
  votes: readonly { proposalId: string; choice: string }[]
) {
  const tallies = new Map<string, VoteTally>();
  for (const v of votes) {
    const t = tallies.get(v.proposalId) ?? {
      interested: 0,
      maybe: 0,
      skip: 0,
      total: 0,
    };
    t.total++;
    if (v.choice === "interested") t.interested++;
    else if (v.choice === "maybe") t.maybe++;
    else t.skip++;
    tallies.set(v.proposalId, t);
  }
  return tallies;
}
