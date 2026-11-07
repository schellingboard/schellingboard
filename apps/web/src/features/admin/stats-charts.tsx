import { useMemo } from "react";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { histogram } from "@schellingboard/domain/stats/binning";
import { ColumnChart } from "../../ui/charts/column-chart";
import { Heatmap } from "../../ui/charts/heatmap";
import { Histogram } from "../../ui/charts/histogram";
import { LineChart } from "../../ui/charts/line-chart";
import { RankedBars } from "../../ui/charts/ranked-bars";
import {
  PredictionScatter,
  type PredictionPoint,
} from "../../ui/charts/prediction-scatter";
import { Scatter } from "../../ui/charts/scatter";
import { StackedBars } from "../../ui/charts/stacked-bars";

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
  return <p className="text-sm text-fg-subtle">No data</p>;
}

const listed = (data: { label: string; value: number }[]) =>
  data.map((d) => `${d.label} ${d.value}`).join(", ");

export const percentLabel = (value: number) =>
  `${Math.round(value * 10) / 10}%`;

export function CountBars({
  table,
  labelKey,
  valueKey,
  xLabel,
  yLabel,
  top,
  only,
  summary = table.title,
  format,
}: {
  table: StatsTable;
  labelKey: string;
  valueKey: string;
  xLabel: string;
  yLabel: string;
  top?: number;
  only?: readonly string[];
  summary?: string;
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
  return (
    <RankedBars
      data={data}
      xLabel={xLabel}
      yLabel={yLabel}
      format={format}
      summary={`${summary}: ${listed(data)}`}
    />
  );
}

export function TableScatter({
  table,
  x,
  y,
  xLabel,
  yLabel,
  noun,
}: {
  table: StatsTable;
  x: string;
  y: string;
  xLabel: string;
  yLabel: string;
  noun: string;
}) {
  const points = useMemo(() => pairs(table, x, y), [table, x, y]);
  if (points.length === 0) return <NoData />;
  return (
    <Scatter
      points={points}
      xLabel={xLabel}
      yLabel={yLabel}
      summary={`${yLabel} against ${xLabel}, ${points.length} ${noun}`}
    />
  );
}

const PREDICTION_KEYS = [
  "reported",
  "predicted",
  "low50",
  "high50",
  "low80",
  "high80",
] as const;

export function PredictedVsReported({ table }: { table: StatsTable }) {
  const points = useMemo(() => {
    const [reported, predicted, low50, high50, low80, high80] =
      PREDICTION_KEYS.map((key) => column(table, key));
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
      summary={`Predicted against reported attendance, ${points.length} ${points.length === 1 ? "session" : "sessions"}`}
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
  return (
    <Histogram
      bins={bins}
      xLabel={xLabel}
      yLabel={yLabel}
      summary={`${table.title}: ${bins.map((b) => `${b.from} to ${b.to}: ${b.count}`).join(", ")}`}
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
    return table.rows
      .map((row) => ({
        label: String(title(row)),
        n: Number(interested(row)),
        values: {
          "Became a session": session(row) ? Number(interested(row)) : 0,
          "Not scheduled": session(row) ? 0 : Number(interested(row)),
        },
      }))
      .sort((a, b) => b.n - a.n)
      .slice(0, TOP_SHOWN);
  }, [table]);
  if (data.length === 0) return <NoData />;
  return (
    <StackedBars
      data={data}
      series={["Became a session", "Not scheduled"]}
      xLabel="Interested votes"
      yLabel="Proposal"
      summary={`Most popular proposals: ${data.map((d) => `${d.label} ${d.n}`).join(", ")}`}
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
  summary: string;
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
      xLabel="Day"
      yLabel={yLabel}
      summary={`${summary}: ${listed(data)}`}
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
  return (
    <div className="space-y-4">
      {days.map(([day, cells]) => (
        <div key={day} className="space-y-1">
          <h3 className="text-sm font-medium text-fg-muted">{day}</h3>
          <Heatmap
            cells={cells}
            xLabel="Hour"
            yLabel="Location"
            valueLabel="Booked share of the open time (%)"
            summary={`Utilization on ${day}`}
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
  return (
    <Heatmap
      cells={cells}
      xLabel="Hour"
      yLabel="Day"
      valueLabel="Accepted meetings"
      summary="Accepted meetings by day and hour"
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
  return (
    <div className="space-y-4">
      {days.map(([day, points]) => (
        <div key={day} className="space-y-1">
          <h3 className="text-sm font-medium text-fg-muted">{day}</h3>
          <LineChart
            series={[{ name: "RSVPs per running session", points }]}
            xLabel="Hour"
            yLabel="RSVPs per running session"
            timeFormat="%H:%M"
            summary={`RSVPs per running session on ${day}`}
          />
        </div>
      ))}
    </div>
  );
}
