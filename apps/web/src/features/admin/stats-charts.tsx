import { useMemo, type ReactNode } from "react";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { Histogram } from "../../ui/charts/histogram";
import { RankedBars } from "../../ui/charts/ranked-bars";
import { Scatter } from "../../ui/charts/scatter";

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
}: {
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
      summary={`${yLabel} against ${xLabel}, ${points.length} sessions`}
    />
  );
}

function SessionCharts({ table }: { table: StatsTable }) {
  return (
    <div className="space-y-4">
      <PopularSessions table={table} />
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

/** The chart that goes with a table, bound by its id; most tables have none. */
export function chartFor(table: StatsTable): ReactNode {
  switch (table.id) {
    case "overview-funnel":
      return <FunnelChart table={table} />;
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
