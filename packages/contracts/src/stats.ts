import { z } from "zod";
import { SESSION_ORIGINS } from "@schellingboard/domain/stats/session-origin";

export const statsColumnTypeSchema = z.enum([
  "text",
  "integer",
  "number",
  "percent",
  "minutes",
  "datetime",
  "boolean",
]);

export const statsCellSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const statsTableSchema = z.object({
  id: z.string().describe("Stable name of the table, also its CSV file name"),
  title: z.string(),
  columns: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      type: statsColumnTypeSchema.describe(
        "A percent is a number from 0 to 100. A null cell means No data"
      ),
    })
  ),
  rows: z.array(z.array(statsCellSchema)),
});
export type StatsTable = z.infer<typeof statsTableSchema>;

const list = (description: string) =>
  z
    .string()
    .optional()
    .describe(description)
    .transform((value) => (value ? value.split(",").filter(Boolean) : []));

export const statsFilterQuerySchema = z.object({
  excludeLocations: list("Comma-separated location ids to leave out"),
  excludeHosts: list("Comma-separated guest ids of hosts to leave out"),
  excludeOrigins: z
    .string()
    .optional()
    .describe(
      "Comma-separated session origins to leave out: blocker, proposal, organizer, spontaneous. Absent means blocker; empty means none"
    )
    .transform((value) => (value === undefined ? "blocker" : value))
    .pipe(
      z
        .string()
        .transform((value) => value.split(",").filter(Boolean))
        .pipe(z.array(z.enum(SESSION_ORIGINS)))
    )
    .transform((origins) => [...new Set(origins)]),
});
export type StatsFilter = z.output<typeof statsFilterQuerySchema>;

export const eventStatisticsSchema = z.object({
  event: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  filterSummary: z.string().describe("The active filter in one line"),
  filterOptions: z.object({
    locations: z.array(z.object({ id: z.string(), name: z.string() })),
    hosts: z.array(z.object({ id: z.string(), name: z.string() })),
  }),
  tables: z.array(statsTableSchema),
});
export type EventStatistics = z.infer<typeof eventStatisticsSchema>;
