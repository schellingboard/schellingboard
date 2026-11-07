import { useMemo, type ReactNode } from "react";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { histogram } from "@schellingboard/domain/stats/binning";
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

const POPULAR_SHOWN = 12;

function column(table: StatsTable, key: string) {
  const index = table.columns.findIndex((c) => c.key === key);
  return (row: StatsTable["rows"][number]) => row[index];
}

function FunnelChart({ table }: { table: StatsTable }) {
  const data = useMemo(
    () =>
      table.rows.map((row) => ({
        label: String(row[0]),
        value: Number(row[1]),
      })),
    [table]
  );
  return (
    <RankedBars
      data={data}
      summary={`${table.title}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
    />
  );
}

function PopularSessions({ table }: { table: StatsTable }) {
  const data = useMemo(() => {
    const title = column(table, "title");
    const rsvps = column(table, "rsvps");
    return table.rows
      .map((row) => ({ label: String(title(row)), value: Number(rsvps(row)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, POPULAR_SHOWN);
  }, [table]);
  if (data.length === 0) return null;
  return (
    <RankedBars
      data={data}
      summary={`Most RSVPed sessions: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
    />
  );
}

function SessionScatter({
  table,
  x,
  y,
  xLabel,
  yLabel,
  noun = "sessions",
}: {
  noun?: string;
  table: StatsTable;
  x: string;
  y: string;
  xLabel: string;
  yLabel: string;
}) {
  const points = useMemo(() => {
    const xs = column(table, x);
    const ys = column(table, y);
    return table.rows.flatMap((row) =>
      xs(row) === null || ys(row) === null
        ? []
        : [{ x: Number(xs(row)), y: Number(ys(row)) }]
    );
  }, [table, x, y]);
  if (points.length === 0) return null;
  return (
    <Scatter
      points={points}
      xLabel={xLabel}
      yLabel={yLabel}
      summary={`${yLabel} against ${xLabel}, ${points.length} ${noun}`}
    />
  );
}

function PredictedVsReported({ table }: { table: StatsTable }) {
  const points = useMemo(() => {
    const get = (key: string) => column(table, key);
    const [reported, predicted, low50, high50, low80, high80] = [
      "reported",
      "predicted",
      "low50",
      "high50",
      "low80",
      "high80",
    ].map(get);
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
  if (points.length === 0) return null;
  return (
    <PredictionScatter
      points={points}
      summary={`Predicted against reported attendance, ${points.length} ${points.length === 1 ? "session" : "sessions"}`}
    />
  );
}

function SessionCharts({ table }: { table: StatsTable }) {
  return (
    <div className="space-y-4">
      <PopularSessions table={table} />
      <PredictedVsReported table={table} />
      <SessionScatter
        table={table}
        x="rsvps"
        y="reported"
        xLabel="RSVPs"
        yLabel="Reported attendees"
      />
      <SessionScatter
        table={table}
        x="interest"
        y="rsvps"
        xLabel="Proposal interest (%)"
        yLabel="RSVPs"
      />
      <SessionScatter
        table={table}
        x="parallel"
        y="rsvps"
        xLabel="Parallel sessions"
        yLabel="RSVPs"
      />
    </div>
  );
}

function BinChart({
  table,
  label,
  countKey = "sessions",
}: {
  table: StatsTable;
  label: string;
  countKey?: string;
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
  if (bins.length === 0) return null;
  return (
    <Histogram
      bins={bins}
      label={label}
      summary={`${table.title}: ${bins.map((b) => `${b.from} to ${b.to}: ${b.count}`).join(", ")}`}
    />
  );
}

function ProposalCharts({ table }: { table: StatsTable }) {
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
      .slice(0, POPULAR_SHOWN);
  }, [table]);
  if (data.length === 0) return null;
  return (
    <div className="space-y-4">
      <StackedBars
        data={data}
        series={["Became a session", "Not scheduled"]}
        summary={`Most popular proposals: ${data.map((d) => `${d.label} ${d.n}`).join(", ")}`}
      />
      <SessionScatter
        table={table}
        x="daysIn"
        y="voters"
        xLabel="Days after the first proposal"
        yLabel="Voters"
        noun="proposals"
      />
    </div>
  );
}

function ProposalTimeline({ table }: { table: StatsTable }) {
  const points = useMemo(() => {
    const day = column(table, "day");
    const count = column(table, "proposals");
    return table.rows.map((row) => ({
      x: new Date(`${day(row)}T00:00:00`),
      y: Number(count(row)),
    }));
  }, [table]);
  if (points.length === 0) return null;
  return (
    <LineChart
      series={[{ name: "Proposals created", points }]}
      summary="Proposals created per day"
    />
  );
}

function VoterHistograms({ table }: { table: StatsTable }) {
  const charts = useMemo(() => {
    const total = table.rows.map((r) => Number(column(table, "total")(r)));
    const share = table.rows.flatMap((r) => {
      const v = column(table, "interestedShare")(r);
      return v === null ? [] : [Number(v)];
    });
    const step = Math.max(1, Math.ceil(Math.max(0, ...total) / 12));
    const edges = [1];
    while (edges[edges.length - 1] <= Math.max(0, ...total))
      edges.push(edges[edges.length - 1] + step);
    return {
      total: histogram(total, edges),
      share: histogram(share, [0, 20, 40, 60, 80, 100]),
      voters: total.length,
    };
  }, [table]);
  if (charts.voters === 0) return null;
  return (
    <div className="space-y-4">
      <Histogram
        bins={charts.total}
        label="Votes per voter"
        summary={`Votes per voter, ${charts.voters} voters`}
      />
      <Histogram
        bins={charts.share}
        label="Share of a voter's votes that are interested (%)"
        summary={`Share interested per voter, ${charts.voters} voters`}
      />
    </div>
  );
}

function RsvpHistogram({ table }: { table: StatsTable }) {
  const bins = useMemo(() => {
    const rsvps = table.rows.map((r) => Number(column(table, "rsvps")(r)));
    const step = Math.max(1, Math.ceil(Math.max(0, ...rsvps) / 12));
    const edges = [1];
    while (edges[edges.length - 1] <= Math.max(0, ...rsvps))
      edges.push(edges[edges.length - 1] + step);
    return { bins: histogram(rsvps, edges), people: rsvps.length };
  }, [table]);
  if (bins.people === 0) return null;
  return (
    <Histogram
      bins={bins.bins}
      label="RSVPs per attendee"
      summary={`RSVPs per attendee, ${bins.people} people`}
    />
  );
}

function CountBars({
  table,
  labelKey,
  valueKey,
}: {
  table: StatsTable;
  labelKey: string;
  valueKey: string;
}) {
  const data = useMemo(() => {
    const label = column(table, labelKey);
    const value = column(table, valueKey);
    return table.rows.map((row) => ({
      label: String(label(row)),
      value: Number(value(row)),
    }));
  }, [table, labelKey, valueKey]);
  if (data.length === 0) return null;
  return (
    <RankedBars
      data={data}
      summary={`${table.title}: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
    />
  );
}

function UtilizationBars({ table }: { table: StatsTable }) {
  const data = useMemo(() => {
    const name = column(table, "location");
    const value = column(table, "utilization");
    return table.rows.flatMap((row) =>
      value(row) === null
        ? []
        : [{ label: String(name(row)), value: Number(value(row)) }]
    );
  }, [table]);
  if (data.length === 0) return null;
  return (
    <RankedBars
      data={data}
      summary={`Utilization by location: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
    />
  );
}

function UtilizationHeatmaps({ table }: { table: StatsTable }) {
  const days = useMemo(() => {
    const day = column(table, "day");
    const location = column(table, "location");
    const hour = column(table, "hour");
    const booked = column(table, "booked");
    const byDay = new Map<string, { x: string; y: string; value: number }[]>();
    for (const row of table.rows) {
      const list = byDay.get(String(day(row))) ?? [];
      list.push({
        x: String(hour(row)),
        y: String(location(row)),
        value: Number(booked(row)),
      });
      byDay.set(String(day(row)), list);
    }
    return [...byDay.entries()];
  }, [table]);
  return (
    <div className="space-y-4">
      {days.map(([day, cells]) => (
        <div key={day} className="space-y-1">
          <h3 className="text-sm font-medium text-fg-muted">{day}</h3>
          <Heatmap
            cells={cells}
            valueLabel="Booked share (%)"
            summary={`Utilization on ${day}`}
          />
        </div>
      ))}
    </div>
  );
}

function SupplyDemand({ table }: { table: StatsTable }) {
  const days = useMemo(() => {
    const day = column(table, "day");
    const hour = column(table, "hour");
    const sessions = column(table, "sessions");
    const rsvps = column(table, "rsvps");
    const byDay = new Map<string, { x: Date; y: number }[]>();
    for (const row of table.rows) {
      if (Number(sessions(row)) <= 0) continue;
      const key = String(day(row));
      const list = byDay.get(key) ?? [];
      list.push({
        x: new Date(`${key}T${String(hour(row)).slice(0, 5)}:00`),
        y: Math.round((Number(rsvps(row)) / Number(sessions(row))) * 10) / 10,
      });
      byDay.set(key, list);
    }
    return [...byDay.entries()];
  }, [table]);
  return (
    <div className="space-y-4">
      {days.map(([day, points]) => (
        <div key={day} className="space-y-1">
          <h3 className="text-sm font-medium text-fg-muted">{day}</h3>
          <LineChart
            series={[{ name: "RSVPs per running session", points }]}
            summary={`RSVPs per running session on ${day}`}
          />
        </div>
      ))}
    </div>
  );
}

function ConversionChart({ table }: { table: StatsTable }) {
  const data = useMemo(() => {
    const group = column(table, "group");
    const share = column(table, "share");
    return table.rows.map((row) => ({
      label: String(group(row)),
      value: Number(share(row)),
    }));
  }, [table]);
  if (data.length === 0) return null;
  return (
    <RankedBars
      data={data}
      summary={`Share that became a session: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
    />
  );
}

/** The chart that goes with a table, bound by its id; most tables have none. */
export function chartFor(table: StatsTable): ReactNode {
  switch (table.id) {
    case "overview-funnel":
      return <FunnelChart table={table} />;
    case "proposals-table":
      return <ProposalCharts table={table} />;
    case "proposals-over-time":
      return <ProposalTimeline table={table} />;
    case "proposals-voters":
      return <VoterHistograms table={table} />;
    case "proposals-conversion":
      return <ConversionChart table={table} />;
    case "attendees-table":
      return <RsvpHistogram table={table} />;
    case "attendees-gaps":
      return <CountBars table={table} labelKey="gap" valueKey="gaps" />;
    case "locations-table":
      return <UtilizationBars table={table} />;
    case "locations-heatmap":
      return <UtilizationHeatmaps table={table} />;
    case "locations-supply-demand":
      return <SupplyDemand table={table} />;
    case "meetings-status":
      return <CountBars table={table} labelKey="status" valueKey="requests" />;
    case "meetings-slots":
      return <BinChart table={table} label="Slots" countKey="people" />;
    case "sessions-table":
      return <SessionCharts table={table} />;
    case "sessions-duration":
      return <BinChart table={table} label="Minutes" />;
    case "sessions-attendance-ratio":
      return <BinChart table={table} label="Attendees per RSVP" />;
    default:
      return null;
  }
}
