import { useCallback, useMemo } from "react";
import { spearman } from "@schellingboard/domain/stats/correlation";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, SURFACE, baseOptions } from "./style";

/** Points with Spearman's rho; below 15 points the trend line is left out and the note says why. */
export function Scatter({
  points,
  summary,
  xLabel,
  yLabel,
}: {
  points: { x: number; y: number }[];
  summary: string;
  xLabel: string;
  yLabel: string;
}) {
  const { rho, n, tooFew } = useMemo(
    () =>
      spearman(
        points.map((p) => p.x),
        points.map((p) => p.y)
      ),
    [points]
  );
  const draw = useCallback(
    (plot: Plot, width: number) =>
      plot.plot({
        ...baseOptions,
        width,
        height: 280,
        x: { label: xLabel, grid: true },
        y: { label: yLabel, grid: true },
        marks: [
          plot.dot(points, {
            x: "x",
            y: "y",
            fill: SERIES[0],
            fillOpacity: 0.8,
            stroke: SURFACE,
            strokeWidth: 2,
            r: 5,
          }),
          ...(tooFew
            ? []
            : [
                plot.linearRegressionY(points, {
                  x: "x",
                  y: "y",
                  stroke: "currentColor",
                }),
              ]),
        ],
      }),
    [points, xLabel, yLabel, tooFew]
  );
  return (
    <div className="space-y-2">
      <PlotFrame summary={summary} draw={draw} />
      <p className="text-xs text-fg-muted">
        {tooFew
          ? `n = ${n}: too few points to read a trend`
          : `ρ = ${rho === null ? "n/a" : rho.toFixed(2)} (n = ${n})`}
      </p>
    </div>
  );
}
