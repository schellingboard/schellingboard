import { useCallback } from "react";
import { ChartLegend } from "./legend";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, SURFACE, baseOptions } from "./style";

export type LineSeries = {
  name: string;
  points: { x: number | Date; y: number }[];
};

export function LineChart({
  series,
  summary,
}: {
  series: LineSeries[];
  summary: string;
}) {
  const draw = useCallback(
    (plot: Plot, width: number) => {
      const points = series.flatMap((s) =>
        s.points.map((p) => ({ ...p, series: s.name }))
      );
      return plot.plot({
        ...baseOptions,
        width,
        height: 240,
        x: { label: null },
        y: { grid: true, label: null },
        color: {
          domain: series.map((s) => s.name),
          range: SERIES.slice(0, series.length),
        },
        marks: [
          plot.line(points, {
            x: "x",
            y: "y",
            stroke: "series",
            strokeWidth: 2,
          }),
          plot.dot(points, {
            x: "x",
            y: "y",
            fill: "series",
            stroke: SURFACE,
            strokeWidth: 2,
            r: 4,
          }),
        ],
      });
    },
    [series]
  );
  return (
    <div className="space-y-2">
      {series.length > 1 && (
        <ChartLegend
          items={series.map((s, i) => ({ label: s.name, color: SERIES[i] }))}
        />
      )}
      <PlotFrame summary={summary} draw={draw} />
    </div>
  );
}
