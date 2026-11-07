import { useCallback } from "react";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, SURFACE, baseOptions, labelMargin, shorten } from "./style";

export type RankedBar = { label: string; value: number };

export function RankedBars({
  data,
  summary,
  xLabel,
  yLabel,
  format = String,
}: {
  data: RankedBar[];
  summary: string;
  xLabel: string;
  yLabel: string;
  format?: (value: number) => string;
}) {
  const draw = useCallback(
    (plot: Plot, width: number) => {
      const marginLeft = labelMargin(
        data.map((d) => d.label),
        width
      );
      return plot.plot({
        ...baseOptions,
        width,
        height: 60 + data.length * 32,
        marginLeft,
        marginRight: 48,
        x: {
          grid: true,
          label: xLabel,
          domain: [0, Math.max(1, ...data.map((d) => d.value))],
        },
        y: {
          type: "band",
          label: yLabel,
          labelAnchor: "top",
          domain: data.map((d) => d.label),
          tickFormat: shorten(marginLeft),
        },
        marks: [
          plot.barX(data, {
            x: "value",
            y: "label",
            fill: SERIES[0],
            stroke: SURFACE,
            strokeWidth: 2,
            rx: 4,
            tip: true,
          }),
          plot.text(data, {
            x: "value",
            y: "label",
            text: (d: RankedBar) => format(d.value),
            dx: 4,
            textAnchor: "start",
            fill: "currentColor",
          }),
          plot.ruleX([0]),
        ],
      });
    },
    [data, xLabel, yLabel, format]
  );
  return <PlotFrame summary={summary} draw={draw} />;
}
