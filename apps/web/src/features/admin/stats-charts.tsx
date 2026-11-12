import { plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { histogram } from "@schellingboard/domain/stats/binning";
import { useMemo } from "react";

import { ColumnChart } from "../../ui/charts/column-chart";
import { Heatmap } from "../../ui/charts/heatmap";
import { Histogram } from "../../ui/charts/histogram";
import { LineChart } from "../../ui/charts/line-chart";
import {
  type PredictionPoint,
  PredictionScatter,
} from "../../ui/charts/prediction-scatter";
import { RankedBars } from "../../ui/charts/ranked-bars";
import { Scatter } from "../../ui/charts/scatter";
import { StackedBars } from "../../ui/charts/stacked-bars";
import { percentLabel } from "./stats-table";

export { percentLabel };

export const TOP_SHOWN = 15;

type Row = StatsTable["rows"][number];

export function column(table: StatsTable, key: string) {
  const index = table.columns.findIndex((c) => c.key === key);
  return (row: Row) => (index < 0 ? null : row[index]);
}

export function pairs(table: StatsTable, x: string, y: string) {
  const xs = column(table, x);
  const ys = column(table, y);
  return table.rows.flatMap((row) =>
    xs(row) === null || ys(row) === null
      ? []
      : [{ x: Number(xs(row)), y: Number(ys(row)) }]
  );
}

function NoData() {
  return (
    <p className="text-sm text-fg-subtle">
      <Trans>No data</Trans>
    </p>
  );
}

const listed = (data: { label: string; value: number }[]) =>
  data.map((d) => `${d.label} ${d.value}`).join(", ");

export function CountBars({
  table,
  labelKey,
  valueKey,
  xLabel,
  yLabel,
  top,
  only,
  summary,
  format,
}: {
  table: StatsTable;
  labelKey: string;
  valueKey: string;
  xLabel: string;
  yLabel: string;
  top?: number;
  only?: readonly string[];
  summary?: (list: string) => string;
  format?: (value: number) => string;
}) {
  const data = useMemo(() => {
    const label = column(table, labelKey);
    const value = column(table, valueKey);
    const bars = table.rows.flatMap((row) =>
      value(row) === null || (only && !only.includes(String(label(row))))
        ? []
        : [{ label: String(label(row)), value: Number(value(row)) }]
    );
    return top ? bars.sort((a, b) => b.value - a.value).slice(0, top) : bars;
  }, [table, labelKey, valueKey, top, only]);
  if (data.length === 0) return <NoData />;
  const title = table.title;
  const list = listed(data);
  return (
    <RankedBars
      data={data}
      xLabel={xLabel}
      yLabel={yLabel}
      format={format}
      summary={summary ? summary(list) : t`${title}: ${list}`}
    />
  );
}

export function TableScatter({
  table,
  x,
  y,
  xLabel,
  yLabel,
  summary,
}: {
  table: StatsTable;
  x: string;
  y: string;
  xLabel: string;
  yLabel: string;
  summary: (n: number) => string;
}) {
  const points = useMemo(() => pairs(table, x, y), [table, x, y]);
  if (points.length === 0) return <NoData />;
  return (
    <Scatter
      points={points}
      xLabel={xLabel}
      yLabel={yLabel}
      summary={summary(points.length)}
    />
  );
}

export function PredictedVsReported({ table }: { table: StatsTable }) {
  const points = useMemo(() => {
    const reported = column(table, "reported");
    const predicted = column(table, "predicted");
    const low50 = column(table, "low50");
    const high50 = column(table, "high50");
    const low80 = column(table, "low80");
    const high80 = column(table, "high80");
    return table.rows.flatMap((row): PredictionPoint[] =>
      reported(row) === null || predicted(row) === null
        ? []
        : [
            {
              reported: Number(reported(row)),
              predicted: Number(predicted(row)),
              low50: Number(low50(row)),
              high50: Number(high50(row)),
              low80: Number(low80(row)),
              high80: Number(high80(row)),
            },
          ]
    );
  }, [table]);
  if (points.length === 0) return <NoData />;
  return (
    <PredictionScatter
      points={points}
      summary={plural(points.length, {
        one: "Predicted against reported attendance, # session",
        other: "Predicted against reported attendance, # sessions",
      })}
    />
  );
}

export function hasPrediction(table: StatsTable) {
  const reported = column(table, "reported");
  const predicted = column(table, "predicted");
  return table.rows.some(
    (row) => reported(row) !== null && predicted(row) !== null
  );
}

export function BinChart({
  table,
  xLabel,
  yLabel,
  countKey,
}: {
  table: StatsTable;
  xLabel: string;
  yLabel: string;
  countKey: string;
}) {
  const bins = useMemo(() => {
    const from = column(table, "from");
    const to = column(table, "to");
    const count = column(table, countKey);
    return table.rows.map((row) => ({
      from: Number(from(row)),
      to: Number(to(row)),
      count: Number(count(row)),
    }));
  }, [table, countKey]);
  if (bins.length === 0) return <NoData />;
  const title = table.title;
  const list = bins.map((b) => `${b.from}–${b.to}: ${b.count}`).join(", ");
  return (
    <Histogram
      bins={bins}
      xLabel={xLabel}
      yLabel={yLabel}
      summary={t`${title}: ${list}`}
    />
  );
}

/** Bins of one per value up to about twelve bars, wider beyond. */
function countEdges(values: number[]) {
  const max = Math.max(0, ...values);
  const step = Math.max(1, Math.ceil(max / 12));
  const edges = [1];
  while (edges[edges.length - 1] <= max)
    edges.push(edges[edges.length - 1] + step);
  return edges;
}

export function CountHistogram({
  table,
  valueKey,
  xLabel,
  yLabel,
  summary,
  edges,
}: {
  table: StatsTable;
  valueKey: string;
  xLabel: string;
  yLabel: string;
  summary: (n: number) => string;
  edges?: number[];
}) {
  const chart = useMemo(() => {
    const value = column(table, valueKey);
    const values = table.rows.flatMap((row) =>
      value(row) === null ? [] : [Number(value(row))]
    );
    return {
      bins: histogram(values, edges ?? countEdges(values)),
      n: values.length,
    };
  }, [table, valueKey, edges]);
  if (chart.n === 0) return <NoData />;
  return (
    <Histogram
      bins={chart.bins}
      xLabel={xLabel}
      yLabel={yLabel}
      summary={summary(chart.n)}
    />
  );
}

export function PopularProposals({ table }: { table: StatsTable }) {
  const data = useMemo(() => {
    const title = column(table, "title");
    const interested = column(table, "interested");
    const session = column(table, "session");
    const became = t`Became a session`;
    const notScheduled = t`Not scheduled`;
    return table.rows
      .map((row) => ({
        label: String(title(row)),
        n: Number(interested(row)),
        values: {
          [became]: session(row) ? Number(interested(row)) : 0,
          [notScheduled]: session(row) ? 0 : Number(interested(row)),
        },
      }))
      .sort((a, b) => b.n - a.n)
      .slice(0, TOP_SHOWN);
  }, [table]);
  if (data.length === 0) return <NoData />;
  const list = data.map((d) => `${d.label} ${d.n}`).join(", ");
  return (
    <StackedBars
      data={data}
      series={[t`Became a session`, t`Not scheduled`]}
      xLabel={t`Interested votes`}
      yLabel={t({
        message: "Proposal",
        comment: "Chart axis: one bar per proposal",
      })}
      summary={t`Most popular proposals: ${list}`}
    />
  );
}

const DAY_MS = 86_400_000;

function everyDay(data: { label: string; value: number }[]) {
  if (data.length === 0) return data;
  const counts = new Map(data.map((d) => [d.label, d.value]));
  const sorted = [...counts.keys()].sort();
  const last = Date.parse(sorted[sorted.length - 1]);
  const days = [];
  for (let t = Date.parse(sorted[0]); t <= last; t += DAY_MS) {
    const label = new Date(t).toISOString().slice(0, 10);
    days.push({ label, value: counts.get(label) ?? 0 });
  }
  return days;
}

export function DayTimeline({
  table,
  valueKey,
  yLabel,
  summary,
}: {
  table: StatsTable;
  valueKey: string;
  yLabel: string;
  summary: (list: string) => string;
}) {
  const data = useMemo(() => {
    const day = column(table, "day");
    const count = column(table, valueKey);
    return everyDay(
      table.rows.map((row) => ({
        label: String(day(row)),
        value: Number(count(row)),
      }))
    );
  }, [table, valueKey]);
  if (data.length === 0) return <NoData />;
  return (
    <ColumnChart
      data={data}
      xLabel={t({ message: "Day", comment: "Chart axis: day of the event" })}
      yLabel={yLabel}
      summary={summary(listed(data))}
    />
  );
}

function byDay<T>(
  table: StatsTable,
  cell: (row: Row, day: string) => T | null
): [string, T[]][] {
  const day = column(table, "day");
  const days = new Map<string, T[]>();
  for (const row of table.rows) {
    const key = String(day(row));
    const value = cell(row, key);
    const list = days.get(key) ?? [];
    if (value !== null) list.push(value);
    days.set(key, list);
  }
  return [...days.entries()];
}

export function UtilizationHeatmaps({ table }: { table: StatsTable }) {
  const days = useMemo(() => {
    const location = column(table, "location");
    const hour = column(table, "hour");
    const booked = column(table, "booked");
    return byDay(table, (row) => ({
      x: String(hour(row)),
      y: String(location(row)),
      value: Number(booked(row)),
    }));
  }, [table]);
  const hourLabel = t({
    message: "Hour",
    comment: "Chart axis: hour of the day",
  });
  return (
    <div className="space-y-4">
      {days.map(([day, cells]) => (
        <div key={day} className="space-y-1">
          <h3 className="text-sm font-medium text-fg-muted">{day}</h3>
          <Heatmap
            cells={cells}
            xLabel={hourLabel}
            yLabel={t({
              message: "Location",
              comment: "Chart axis: one row per location",
            })}
            valueLabel={t`Booked share of the open time (%)`}
            summary={t`Utilization on ${day}`}
          />
        </div>
      ))}
    </div>
  );
}

export function MeetingsHeatmap({ table }: { table: StatsTable }) {
  const cells = useMemo(() => {
    const day = column(table, "day");
    const hour = column(table, "hour");
    const meetings = column(table, "meetings");
    return table.rows.map((row) => ({
      x: String(hour(row)),
      y: String(day(row)),
      value: Number(meetings(row)),
    }));
  }, [table]);
  if (cells.length === 0) return <NoData />;
  const hourLabel = t({
    message: "Hour",
    comment: "Chart axis: hour of the day",
  });
  return (
    <Heatmap
      cells={cells}
      xLabel={hourLabel}
      yLabel={t({ message: "Day", comment: "Chart axis: day of the event" })}
      valueLabel={t`Accepted meetings`}
      summary={t`Accepted meetings by day and hour`}
    />
  );
}

export function SupplyDemand({ table }: { table: StatsTable }) {
  const days = useMemo(() => {
    const hour = column(table, "hour");
    const sessions = column(table, "sessions");
    const rsvps = column(table, "rsvps");
    return byDay(table, (row, day) =>
      Number(sessions(row)) <= 0
        ? null
        : {
            // Plot shows dates in UTC, so a UTC date shows the event's own hour.
            x: new Date(`${day}T${String(hour(row)).slice(0, 5)}:00Z`),
            y:
              Math.round((Number(rsvps(row)) / Number(sessions(row))) * 10) /
              10,
          }
    ).filter(([, points]) => points.length > 0);
  }, [table]);
  const rsvpsLabel = t`RSVPs per running session`;
  return (
    <div className="space-y-4">
      {days.map(([day, points]) => (
        <div key={day} className="space-y-1">
          <h3 className="text-sm font-medium text-fg-muted">{day}</h3>
          <LineChart
            series={[{ name: rsvpsLabel, points }]}
            xLabel={t({
              message: "Hour",
              comment: "Chart axis: hour of the day",
            })}
            yLabel={rsvpsLabel}
            timeFormat="%H:%M"
            summary={t`RSVPs per running session on ${day}`}
          />
        </div>
      ))}
    </div>
  );
}
