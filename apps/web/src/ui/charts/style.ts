/** The categorical slots in their fixed order; the values live in styles/tokens.css, per theme. */
export const SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
] as const;

export const SURFACE = "var(--surface)";

export const baseOptions = {
  style: {
    background: "transparent",
    color: "var(--fg-muted)",
    fontSize: "12px",
    overflow: "visible",
  },
} as const;

const CHAR_WIDTH = 6.5;

/** Room for category labels on the left: their length, up to a third of the chart. */
export function labelMargin(labels: string[], width: number) {
  const longest = Math.max(0, ...labels.map((label) => label.length));
  return Math.min(
    Math.max(80, Math.floor(width / 3)),
    16 + longest * CHAR_WIDTH
  );
}

/** A label cut to the margin with an ellipsis; the tooltip has it in full. */
export function shorten(margin: number) {
  const fits = Math.max(4, Math.floor((margin - 16) / CHAR_WIDTH));
  return (label: string) =>
    label.length > fits ? `${label.slice(0, fits - 1)}…` : label;
}
