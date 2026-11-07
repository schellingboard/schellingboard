export type Bin = { from: number; to: number; count: number };

export function histogram(
  values: readonly number[],
  edges: readonly number[]
): Bin[] {
  const bins = edges
    .slice(1)
    .map((to, i) => ({ from: edges[i], to, count: 0 }));
  const last = edges[edges.length - 1];
  for (const value of values) {
    const bin = bins.find(
      (b) =>
        value >= b.from && (value < b.to || (b.to === last && value === last))
    );
    if (bin) bin.count++;
  }
  return bins;
}

export function quantile(values: readonly number[], q: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * q;
  const low = Math.floor(position);
  const high = Math.ceil(position);
  return sorted[low] + (sorted[high] - sorted[low]) * (position - low);
}

export const median = (values: readonly number[]) => quantile(values, 0.5);
