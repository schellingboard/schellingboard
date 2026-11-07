import type {
  EventStatistics,
  StatsFilter,
} from "@schellingboard/contracts/stats";
import { TOO_FEW_TO_SAY } from "@schellingboard/domain/stats/correlation";
import { encodeCsv } from "@schellingboard/domain/stats/csv";
import {
  filterSummary,
  isDefaultFilter,
} from "@schellingboard/domain/stats/filter";
import type { Actor } from "@/server/kernel/actor";
import { forbidden, notFound, ok, type Result } from "@/server/kernel/result";
import type { StatsDeps } from "../ports";
import { overviewTables } from "./overview";
import { sessionTables } from "./sessions";

export interface StatsFile {
  name: string;
  content: string;
}

export const eventStatistics =
  (deps: StatsDeps) =>
  async (
    actor: Actor,
    eventId: string,
    filter: StatsFilter
  ): Promise<Result<EventStatistics>> => {
    if (!actor.admin) return forbidden("admin.required", "Unauthorized");
    const facts = await deps.repos.stats.getEventFacts(eventId);
    if (!facts) return notFound("event.notFound", "Event not found");
    return ok({
      event: facts.event,
      filterSummary: filterSummary(filter),
      filterOptions: { locations: facts.locations, hosts: facts.hosts },
      tables: [
        ...overviewTables(facts, filter),
        ...sessionTables(facts, filter, deps.now()),
      ],
    });
  };

const fileName = (slug: string, table: string, filter: StatsFilter) =>
  `${slug}-${table}${isDefaultFilter(filter) ? "" : "-filtered"}.csv`;

export const statisticsCsv =
  (deps: StatsDeps) =>
  async (
    actor: Actor,
    eventId: string,
    tableId: string,
    filter: StatsFilter
  ): Promise<Result<StatsFile>> => {
    const stats = await eventStatistics(deps)(actor, eventId, filter);
    if (!stats.ok) return stats;
    const table = stats.value.tables.find((t) => t.id === tableId);
    if (!table) return notFound("stats.tableNotFound", "No such table");
    return ok({
      name: fileName(stats.value.event.slug, table.id, filter),
      content: encodeCsv(table.columns, table.rows),
    });
  };

export const statisticsFiles =
  (deps: StatsDeps) =>
  async (
    actor: Actor,
    eventId: string,
    filter: StatsFilter,
    now: Date
  ): Promise<Result<{ archive: string; files: StatsFile[] }>> => {
    const stats = await eventStatistics(deps)(actor, eventId, filter);
    if (!stats.ok) return stats;
    const { event, tables } = stats.value;
    const about = [
      `Statistics for ${event.name}`,
      `Filter: ${stats.value.filterSummary}`,
      `Exported: ${now.toISOString()}`,
      `Release: ${deps.version()}`,
      "",
      "Every figure counts what the database holds now. RSVPs are intent, not",
      "attendance. Attendee counts are reported by hosts and are rough.",
      `A correlation below ${TOO_FEW_TO_SAY} pairs is too few to say anything.`,
      "",
    ].join("\n");
    return ok({
      archive: `${event.slug}-statistics${isDefaultFilter(filter) ? "" : "-filtered"}.zip`,
      files: [
        ...tables.map((t) => ({
          name: fileName(event.slug, t.id, filter),
          content: encodeCsv(t.columns, t.rows),
        })),
        { name: "about.txt", content: about },
      ],
    });
  };
