import { useCallback } from "react";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, SURFACE, baseOptions } from "./style";

export type PredictionPoint = {
  reported: number;
  predicted: number;
  low50: number;
  high50: number;
  low80: number;
  high80: number;
};

/** Reported attendance against the model's midpoint, with the 50% and 80% ranges and the line y = x. */
export function PredictionScatter({
  points,
  summary,
}: {
  points: PredictionPoint[];
  summary: string;
}) {
  const draw = useCallback(
    (plot: Plot, width: number) => {
      const top = Math.max(1, ...points.flatMap((p) => [p.reported, p.high80]));
      return plot.plot({
        ...baseOptions,
        width,
        height: 300,
        x: { label: "Reported attendees", grid: true, domain: [0, top] },
        y: { label: "Predicted attendees", grid: true, domain: [0, top] },
        marks: [
          plot.line(
            [
              { x: 0, y: 0 },
              { x: top, y: top },
            ],
            { x: "x", y: "y", stroke: "currentColor", strokeDasharray: "4 4" }
          ),
          plot.ruleX(points, {
            x: "reported",
            y1: "low80",
            y2: "high80",
            stroke: SERIES[0],
            strokeOpacity: 0.4,
            strokeWidth: 2,
          }),
          plot.ruleX(points, {
            x: "reported",
            y1: "low50",
            y2: "high50",
            stroke: SERIES[0],
            strokeWidth: 5,
          }),
          plot.dot(points, {
            x: "reported",
            y: "predicted",
            fill: SERIES[0],
            stroke: SURFACE,
            strokeWidth: 2,
            r: 5,
          }),
        ],
      });
    },
    [points]
  );
  return (
    <div className="space-y-2">
      <PlotFrame summary={summary} draw={draw} />
      <p className="text-xs text-fg-muted">
        Dots are the model&apos;s midpoint, thick bars its 50% range, thin bars
        its 80% range. On the dashed line the prediction was exact. The model
        was fitted on one event, n = 13.
      </p>
    </div>
  );
}
