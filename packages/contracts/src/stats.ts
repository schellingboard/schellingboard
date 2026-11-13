import { SESSION_ORIGINS } from "@schellingboard/domain/stats/session-origin";
import { z } from "zod";

export const statsColumnTypeSchema = z.enum([
  "text",
  "integer",
  "number",
  "percent",
  "minutes",
  "datetime",
  "boolean",
  "label",
]);

export const statsCellSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const statsTableSchema = z.object({
  id: z.string().describe("Stable name of the table, also its CSV file name"),
  titleId: z
    .string()
    .describe("Id of the table's title; the client turns it into text"),
  columns: z.array(
    z.object({
      key: z.string(),
      labelId: z
        .string()
        .describe("Id of the column's heading; the client turns it into text"),
      type: statsColumnTypeSchema.describe(
        "A percent is a number from 0 to 100. A null cell means No data. A label cell holds a text id, or `id:param` when the text embeds one raw value; the client turns it into text"
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
  filterSummary: z
    .object({
      locations: z.number().int().describe("Locations left out"),
      hosts: z.number().int().describe("Hosts left out"),
      origins: z.array(z.enum(SESSION_ORIGINS)).describe("Origins left out"),
    })
    .describe("What the active filter leaves out; the client words it"),
  filterOptions: z.object({
    locations: z.array(z.object({ id: z.string(), name: z.string() })),
    hosts: z.array(z.object({ id: z.string(), name: z.string() })),
  }),
  tables: z.array(statsTableSchema),
});
export type EventStatistics = z.infer<typeof eventStatisticsSchema>;
