export type CsvCell = string | number | boolean | null;

const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: CsvCell): string {
  if (value === null) return "";
  if (typeof value !== "string") return String(value);
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function encodeCsv(
  columns: readonly { label: string }[],
  rows: readonly (readonly CsvCell[])[]
): string {
  const lines = [columns.map((c) => c.label), ...rows].map(
    (row) => row.map(cell).join(",") + "\r\n"
  );
  return "\uFEFF" + lines.join("");
}
