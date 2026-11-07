import { useCallback } from "react";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, SURFACE, baseOptions } from "./style";

export type RankedBar = { label: string; value: number };

export function RankedBars({
  data,
  summary,
}: {
  data: RankedBar[];
  summary: string;
}) {
  const draw = useCallback(
    (plot: Plot, width: number) =>
      plot.plot({
        ...baseOptions,
        width,
        height: 40 + data.length * 32,
        marginLeft: 120,
        x: { grid: true, label: null },
        y: { label: null, domain: data.map((d) => d.label) },
        marks: [
          plot.barX(data, {
            x: "value",
            y: "label",
            fill: SERIES[0],
            stroke: SURFACE,
            strokeWidth: 2,
            rx: 4,
          }),
          plot.text(data, {
            x: "value",
            y: "label",
            text: (d: RankedBar) => String(d.value),
            dx: 4,
            textAnchor: "start",
            fill: "currentColor",
          }),
          plot.ruleX([0]),
        ],
      }),
    [data]
  );
  return <PlotFrame summary={summary} draw={draw} />;
}
