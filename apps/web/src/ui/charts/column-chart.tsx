import { useCallback } from "react";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, SURFACE, baseOptions } from "./style";

const MAX_TICKS = 31;

export type Column = { label: string; value: number };

/** One column per label, in the given order: counts per day or per hour. */
export function ColumnChart({
  data,
  summary,
  xLabel,
  yLabel,
}: {
  data: Column[];
  summary: string;
  xLabel: string;
  yLabel: string;
}) {
  const draw = useCallback(
    (plot: Plot, width: number) =>
      plot.plot({
        ...baseOptions,
        width,
        height: 240,
        x: {
          type: "band",
          label: xLabel,
          domain: data.map((d) => d.label),
          ticks: data
            .filter((_, i) => i % Math.ceil(data.length / MAX_TICKS) === 0)
            .map((d) => d.label),
          tickRotate: data.length > 10 ? -30 : 0,
        },
        y: {
          grid: true,
          label: yLabel,
          domain: [0, Math.max(1, ...data.map((d) => d.value))],
        },
        marginBottom: data.length > 10 ? 56 : 32,
        marks: [
          plot.barY(data, {
            x: "label",
            y: "value",
            fill: SERIES[0],
            stroke: SURFACE,
            strokeWidth: 2,
            rx: 4,
            tip: true,
          }),
          plot.ruleY([0]),
        ],
      }),
    [data, xLabel, yLabel]
  );
  return <PlotFrame summary={summary} draw={draw} />;
}
