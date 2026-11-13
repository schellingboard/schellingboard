import type { StatsTable } from "@schellingboard/contracts/stats";
import { histogram } from "@schellingboard/domain/stats/binning";
import type { EventFacts } from "@schellingboard/domain/stats/facts";
import {
  applyFilter,
  type StatsFilterInput,
} from "@schellingboard/domain/stats/filter";
import { DateTime } from "luxon";

import { col, doublingEdges } from "./cells";

const KINDS = [
  ["proposal", "proposals"],
  ["session", "sessions"],
  ["profile", "profiles"],
] as const;

export function commentTables(
  facts: EventFacts,
  filter: StatsFilterInput
): StatsTable[] {
  if (facts.comments.length === 0) return [];
  const { sessions, proposals, people } = applyFilter(facts, filter);
  const targets = {
    proposal: new Set(proposals.map((p) => p.id)),
    session: new Set(sessions.map((s) => s.id)),
    profile: people,
  };
  const kept = facts.comments.filter(
    (c) =>
      targets[c.kind].has(c.targetId) &&
      (c.authorId === null || people.has(c.authorId))
  );
  const live = kept.filter((c) => !c.deleted);

  const perTarget: StatsTable = {
    id: "comments-targets",
    titleId: "commentsByWhatTheyAreOn",
    columns: [
      col("target", "on", "label"),
      col("comments", "comments", "integer"),
      col("authors", "authors", "integer"),
      col("replies", "replies", "integer"),
      col("likes", "likes", "integer"),
      col("edited", "edited", "integer"),
      col("deleted", "deletedKeptForReplies", "integer"),
    ],
    rows: KINDS.map(([kind, label]) => {
      const mine = live.filter((c) => c.kind === kind);
      return [
        label,
        mine.length,
        new Set(mine.flatMap((c) => (c.authorId ? [c.authorId] : []))).size,
        mine.filter((c) => c.replyTo !== null).length,
        mine.reduce(
          (sum, c) => sum + c.likerIds.filter((id) => people.has(id)).length,
          0
        ),
        mine.filter((c) => c.edited).length,
        kept.filter((c) => c.kind === kind && c.deleted).length,
      ];
    }),
  };

  const byDay = new Map<string, number>();
  for (const c of live) {
    const day = DateTime.fromISO(c.createdTime, {
      zone: facts.timezone,
    }).toISODate()!;
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const perDay: StatsTable = {
    id: "comments-per-day",
    titleId: "commentsPerDay",
    columns: [
      col("day", "day", "text"),
      col("comments", "comments", "integer"),
    ],
    rows: [...byDay].sort(([a], [b]) => a.localeCompare(b)),
  };

  const perAuthor = new Map<string, number>();
  for (const c of live)
    if (c.authorId)
      perAuthor.set(c.authorId, (perAuthor.get(c.authorId) ?? 0) + 1);
  const totals = [...perAuthor.values()];
  const authors: StatsTable = {
    id: "comments-per-author",
    titleId: "commentsPerAuthor",
    columns: [
      col("from", "commentsFrom", "integer"),
      col("to", "commentsUpTo", "integer"),
      col("authors", "authors", "integer"),
    ],
    rows:
      totals.length === 0
        ? []
        : histogram(totals, doublingEdges(Math.max(...totals))).map((b) => [
            b.from,
            b.to,
            b.count,
          ]),
  };

  return [perTarget, perDay, authors];
}
