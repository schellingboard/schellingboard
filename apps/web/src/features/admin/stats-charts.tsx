import { useMemo, type ReactNode } from "react";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { RankedBars } from "../../ui/charts/ranked-bars";

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

/** The chart that goes with a table, bound by its id; most tables have none. */
export function chartFor(table: StatsTable): ReactNode {
  return table.id === "overview-funnel" ? <FunnelChart table={table} /> : null;
}
