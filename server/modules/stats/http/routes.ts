import { createRoute, z } from "@hono/zod-openapi";
import {
  eventStatisticsSchema,
  statsFilterQuerySchema,
} from "@schellingboard/contracts/stats";
import { zipSync, strToU8 } from "fflate";
import { problem, problemDefault } from "@/server/http/problem";
import { json, type App } from "@/server/http/route-parts";
import type { StatsUseCases } from "../application/use-cases";

const tags = ["admin"];
const params = z.object({ id: z.string().min(1) });
const fileParams = params.extend({
  file: z
    .string()
    .regex(/^[a-z0-9-]+\.csv$/)
    .describe("The table id and `.csv`, e.g. `overview-funnel.csv`"),
});

const download = (description: string, type: string) => ({
  description,
  content: { [type]: { schema: z.string().openapi({ format: "binary" }) } },
});

const getStats = createRoute({
  method: "get",
  path: "/admin/events/{id}/stats",
  tags,
  description:
    "The event's statistics: every table, the active filter in one line and the locations and hosts a filter can leave out. Site admins only.",
  request: { params, query: statsFilterQuerySchema },
  responses: {
    200: json(eventStatisticsSchema, "The statistics"),
    ...problemDefault,
  },
});

const getCsv = createRoute({
  method: "get",
  path: "/admin/events/{id}/stats/{file}",
  tags,
  description: "One statistics table as CSV (UTF-8 with a byte order mark).",
  request: { params: fileParams, query: statsFilterQuerySchema },
  responses: {
    200: download("The table as CSV", "text/csv"),
    ...problemDefault,
  },
});

const getZip = createRoute({
  method: "get",
  path: "/admin/events/{id}/stats.zip",
  tags,
  description:
    "Every statistics table as CSV, plus an `about.txt` with the filter and the caveats.",
  request: { params, query: statsFilterQuerySchema },
  responses: {
    200: download("The ZIP archive", "application/zip"),
    ...problemDefault,
  },
});

const attachment = (name: string) => `attachment; filename="${name}"`;

export function addAdminStatsRoutes(app: App, stats: () => StatsUseCases) {
  app.openapi(getStats, async (c) => {
    const { id } = c.req.valid("param");
    const result = await stats().eventStatistics(
      c.var.actor,
      id,
      c.req.valid("query")
    );
    if (!result.ok) return problem(result.error);
    return c.json(result.value, 200);
  });

  app.openapi(getCsv, async (c) => {
    const { id, file } = c.req.valid("param");
    const result = await stats().statisticsCsv(
      c.var.actor,
      id,
      file.slice(0, -".csv".length),
      c.req.valid("query")
    );
    if (!result.ok) return problem(result.error);
    return c.body(result.value.content, 200, {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": attachment(result.value.name),
    });
  });

  app.openapi(getZip, async (c) => {
    const { id } = c.req.valid("param");
    const result = await stats().statisticsFiles(
      c.var.actor,
      id,
      c.req.valid("query"),
      c.var.now
    );
    if (!result.ok) return problem(result.error);
    const archive = zipSync(
      Object.fromEntries(
        result.value.files.map((f) => [f.name, strToU8(f.content)])
      )
    );
    return c.body(archive, 200, {
      "content-type": "application/zip",
      "content-disposition": attachment(result.value.archive),
    });
  });
}
