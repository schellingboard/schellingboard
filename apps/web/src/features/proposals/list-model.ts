import Fuse from "fuse.js";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { LoggedProposal } from "@schellingboard/domain/change";
import { dateStartDescription } from "@schellingboard/domain/phase-opens-text";
import {
  inProposalPhase,
  inSchedPhase,
  inVotingPhase,
} from "@schellingboard/domain/phase";
import { wantsHost } from "@schellingboard/domain/session";
import type { VoteChoice } from "@schellingboard/domain/vote";
import { voteChoiceRank } from "@schellingboard/domain/vote-display";
import { plainText } from "../../ui/plain-text";
import { proposalsFrom, toEvent } from "../../replica/selectors";
import type { Standing } from "../../queries/proposal-standings";

export type Row = LoggedProposal & {
  hostNames: string[];
  plainDescription: string;
};

export type Filter = "mine" | "voted" | "unvoted" | "hostWanted" | undefined;

export type SortKey =
  | "title"
  | "hosts"
  | "durationMinutes"
  | "updatedTime"
  | "votesCount"
  | "userVote"
  | "votes";

export type Sort = { key: SortKey; direction: "asc" | "desc" };

export type ListInput = {
  rows: Row[];
  guestId: string | null;
  votes: ReadonlyMap<string, VoteChoice>;
  standings: ReadonlyMap<string, Standing>;
  query: string;
  filter: Filter;
  sort: Sort;
};

export function rowsFrom(snapshot: Snapshot): Row[] {
  return proposalsFrom(snapshot).map((p) => ({
    ...p,
    hostNames: p.hosts.map((h) => h.name),
    plainDescription: plainText(p.description ?? ""),
  }));
}

/** A filter that needs a signed-in guest does nothing without one. */
export function effectiveFilter(
  filter: Filter,
  guestId: string | null
): Filter {
  return guestId || filter === "hostWanted" ? filter : undefined;
}

export function filteredRows(
  rows: Row[],
  { filter, guestId, votes }: Pick<ListInput, "filter" | "guestId" | "votes">
): Row[] {
  const effective = effectiveFilter(filter, guestId);
  if (!effective) return rows;
  return rows.filter((row) => {
    if (effective === "hostWanted") return wantsHost(row);
    const actual: Filter = row.hosts.some((h) => h.id === guestId)
      ? "mine"
      : votes.has(row.id)
        ? "voted"
        : "unvoted";
    return effective === actual;
  });
}

function searched(rows: Row[], query: string): Row[] {
  return new Fuse(rows, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "hostNames", weight: 0.25 },
      { name: "plainDescription", weight: 0.15 },
    ],
    ignoreLocation: true,
    threshold: 0.3,
  })
    .search(query)
    .map((r) => r.item);
}

const weighted = (s: Standing | undefined) =>
  s?.tally ? s.tally.interested * 4 + s.tally.maybe : 0;

function compare(
  a: Row,
  b: Row,
  { key }: Sort,
  { votes, standings }: ListInput
): number {
  switch (key) {
    case "title":
      return a.title.localeCompare(b.title);
    case "hosts": {
      if (a.hosts.length === 0 || b.hosts.length === 0)
        return a.hosts.length === b.hosts.length
          ? 0
          : a.hosts.length === 0
            ? -1
            : 1;
      const names = (r: Row) =>
        [...r.hostNames].sort((x, y) => x.localeCompare(y)).join("");
      return names(a).localeCompare(names(b));
    }
    case "durationMinutes":
      return (a.durationMinutes ?? 0) - (b.durationMinutes ?? 0);
    case "updatedTime":
      return a.updatedTime.getTime() - b.updatedTime.getTime();
    case "votesCount":
      return (
        (standings.get(a.id)?.total ?? 0) - (standings.get(b.id)?.total ?? 0)
      );
    case "userVote":
      return voteChoiceRank(votes.get(a.id)) - voteChoiceRank(votes.get(b.id));
    case "votes":
      return weighted(standings.get(a.id)) - weighted(standings.get(b.id));
  }
}

/** A search is ordered by relevance; an explicit sort would throw that away. */
export function listRows(input: ListInput): Row[] {
  const rows = filteredRows(input.rows, input);
  if (input.query.trim()) return searched(rows, input.query);
  const sign = input.sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => sign * compare(a, b, input.sort, input));
}

export function defaultSort(event: Snapshot["event"], now: Date): Sort {
  return inVotingPhase(toEvent(event), now)
    ? { key: "votesCount", direction: "asc" }
    : { key: "updatedTime", direction: "desc" };
}

export function sortOptions(
  event: Snapshot["event"],
  now: Date
): { value: string; label: string }[] {
  const e = toEvent(event);
  const option = (
    key: SortKey,
    direction: Sort["direction"],
    label: string
  ) => ({
    value: `${key}-${direction}`,
    label,
  });
  return [
    option("updatedTime", "desc", "Recently updated"),
    ...(inVotingPhase(e, now)
      ? [option("votesCount", "asc", "Fewest votes first")]
      : []),
    option("title", "asc", "Title ↓"),
    option("title", "desc", "Title ↑"),
    option("hosts", "asc", "Host(s) ↓"),
    option("hosts", "desc", "Host(s) ↑"),
    option("durationMinutes", "asc", "Duration ↓"),
    option("durationMinutes", "desc", "Duration ↑"),
    option("userVote", "asc", "Your vote ↓"),
    option("userVote", "desc", "Your vote ↑"),
    ...(inSchedPhase(e, now)
      ? [option("votes", "asc", "Votes ↓"), option("votes", "desc", "Votes ↑")]
      : []),
  ];
}

/** Why each action is unavailable; empty when it is available. */
export function phaseTexts(
  event: Snapshot["event"],
  now: Date,
  signedIn: boolean,
  localZone: string | null
): { proposing: string; voting: string; scheduling: string } {
  const e = toEvent(event);
  const opens = (date: Date | undefined) =>
    dateStartDescription(date, e.timezone, localZone);
  const scheduling = inSchedPhase(e, now);
  return {
    proposing: scheduling
      ? "Proposal and voting phases are over"
      : signedIn
        ? ""
        : "Select a user first",
    voting: scheduling
      ? "The voting phase is over"
      : inProposalPhase(e, now)
        ? `Voting ${opens(e.votingPhaseStart)}`
        : signedIn
          ? ""
          : "Select a user first",
    scheduling: `Scheduling ${opens(e.schedulingPhaseStart)}`,
  };
}
