function compareDescending(a: readonly number[], b: readonly number[]) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (b[i] ?? 0) - (a[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function pseudonymize(rows: readonly (readonly number[])[]) {
  const width = Math.max(3, String(rows.length).length);
  return [...rows].sort(compareDescending).map((values, i) => ({
    pseudonym: `P${String(i + 1).padStart(width, "0")}`,
    values: [...values],
  }));
}
