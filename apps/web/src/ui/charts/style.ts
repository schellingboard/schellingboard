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
