import { useCallback } from "react";
import { PlotFrame, type Plot } from "./plot-frame";
import { SERIES, baseOptions } from "./style";

export type HeatCell = { x: string; y: string; value: number };

/** The value is the opacity of one hue, so the surface behind shows through in either theme. */
export function Heatmap({
  cells,
  summary,
  valueLabel,
}: {
  cells: HeatCell[];
  summary: string;
  valueLabel: string;
}) {
  const max = Math.max(0, ...cells.map((c) => c.value));
  const draw = useCallback(
    (plot: Plot, width: number) =>
      plot.plot({
        ...baseOptions,
        width,
        marginLeft: 100,
        x: { label: null },
        y: { label: null },
        marks: [
          plot.cell(cells, {
            x: "x",
            y: "y",
            fill: SERIES[0],
            fillOpacity: (c: HeatCell) =>
              c.value === 0 ? 0 : 0.1 + (0.9 * c.value) / max,
            stroke: "var(--line-subtle)",
            inset: 1,
          }),
        ],
      }),
    [cells, max]
  );
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-fg-muted">
        <span
          aria-hidden="true"
          className="h-2.5 w-24 rounded-sm border border-line-subtle"
          style={{
            background: `linear-gradient(to right, transparent, ${SERIES[0]})`,
          }}
        />
        <span>{`${valueLabel}: 0 to ${max}`}</span>
      </div>
      <PlotFrame summary={summary} draw={draw} />
    </div>
  );
}
