export const OTHER = "Other";
export const MIN_GROUP = 3;

export function suppressSmall(values: readonly string[], k = MIN_GROUP) {
  const groups = new Map<string, { value: string; count: number }>();
  for (const raw of values) {
    const value = raw.trim();
    if (value === "") continue;
    const key = value.toLowerCase();
    const group = groups.get(key);
    if (group) group.count++;
    else groups.set(key, { value, count: 1 });
  }
  const all = [...groups.entries()];
  const shown = all
    .filter(([key, g]) => g.count >= k && key !== OTHER.toLowerCase())
    .map(([, g]) => g);
  const hidden = all
    .filter(([key, g]) => g.count < k || key === OTHER.toLowerCase())
    .reduce((sum, [, g]) => sum + g.count, 0);
  shown.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  return hidden > 0 ? [...shown, { value: OTHER, count: hidden }] : shown;
}
