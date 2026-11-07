import { useCallback } from "react";
import type { Bin } from "@schellingboard/domain/stats/binning";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, SURFACE, baseOptions } from "./style";

/** Counts per bin, the bins already cut by `histogram` in the domain package. */
export function Histogram({
  bins,
  summary,
  label,
}: {
  bins: Bin[];
  summary: string;
  label?: string;
}) {
  const draw = useCallback(
    (plot: Plot, width: number) =>
      plot.plot({
        ...baseOptions,
        width,
        height: 220,
        x: { label: label ?? null },
        y: { grid: true, label: null },
        marks: [
          plot.rectY(bins, {
            x1: "from",
            x2: "to",
            y: "count",
            fill: SERIES[0],
            stroke: SURFACE,
            strokeWidth: 2,
            rx: 4,
          }),
          plot.ruleY([0]),
        ],
      }),
    [bins, label]
  );
  return <PlotFrame summary={summary} draw={draw} />;
}
