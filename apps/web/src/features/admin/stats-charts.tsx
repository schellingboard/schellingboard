import { useMemo, type ReactNode } from "react";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { histogram } from "@schellingboard/domain/stats/binning";
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

function BinChart({ table, label }: { table: StatsTable; label: string }) {
  const bins = useMemo(() => {
    const from = column(table, "from");
    const to = column(table, "to");
    const count = column(table, "sessions");
    return table.rows.map((row) => ({
      from: Number(from(row)),
      to: Number(to(row)),
      count: Number(count(row)),
    }));
  }, [table]);
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
