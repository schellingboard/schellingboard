import { useCallback } from "react";
import { ChartLegend } from "./legend";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, SURFACE, baseOptions } from "./style";

export type StackedBar = { label: string; values: Record<string, number> };

/** One horizontal bar per label, split by series (at most four, in a fixed colour order). */
export function StackedBars({
  data,
  series,
  summary,
}: {
  data: StackedBar[];
  series: string[];
  summary: string;
}) {
  const draw = useCallback(
    (plot: Plot, width: number) => {
      const parts = data.flatMap((d) =>
        series.map((name) => ({
          label: d.label,
          series: name,
          value: d.values[name] ?? 0,
        }))
      );
      return plot.plot({
        ...baseOptions,
        width,
        height: 60 + data.length * 32,
        marginLeft: 120,
        x: { grid: true, label: null },
        y: { label: null, domain: data.map((d) => d.label) },
        color: { domain: series, range: SERIES.slice(0, series.length) },
        marks: [
          plot.barX(parts, {
            x: "value",
            y: "label",
            fill: "series",
            stroke: SURFACE,
            strokeWidth: 2,
          }),
          plot.ruleX([0]),
        ],
      });
    },
    [data, series]
  );
  return (
    <div className="space-y-2">
      <ChartLegend
        items={series.map((label, i) => ({ label, color: SERIES[i] }))}
      />
      <PlotFrame summary={summary} draw={draw} />
    </div>
  );
}
