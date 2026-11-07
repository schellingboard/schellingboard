import { useState } from "react";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { cx } from "../../ui/cx";

type Cell = StatsTable["rows"][number][number];
type Column = StatsTable["columns"][number];

export function formatCell(cell: Cell, type: Column["type"]): string {
  if (cell === null) return "No data";
  switch (type) {
    case "percent":
      return `${Math.round(Number(cell) * 10) / 10}%`;
    case "minutes":
      return `${Math.round(Number(cell) * 10) / 10} min`;
    case "number":
      return String(Math.round(Number(cell) * 100) / 100);
    case "boolean":
      return cell ? "Yes" : "No";
    default:
      return String(cell);
  }
}

/** Rows ordered by one column; cells without data always come last. */
export function sortRows(
  rows: StatsTable["rows"],
  column: number,
  direction: "asc" | "desc"
) {
  const sign = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = a[column];
    const y = b[column];
    if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
    if (typeof x === "string" && typeof y === "string")
      return sign * x.localeCompare(y, undefined, { numeric: true });
    return sign * (Number(x) - Number(y));
  });
}

export function SortableStatsTable({ table }: { table: StatsTable }) {
  const [sort, setSort] = useState<{
    column: number;
    direction: "asc" | "desc";
  } | null>(null);
  const rows = sort
    ? sortRows(table.rows, sort.column, sort.direction)
    : table.rows;
  const headingId = `stats-${table.id}`;

  return (
    <div className="overflow-x-auto">
      <table aria-labelledby={headingId} className="w-full text-sm">
        <thead>
          <tr className="border-b border-line-subtle text-left text-fg-muted">
            {table.columns.map((column, index) => {
              const active = sort?.column === index;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cx(
                    "py-2 pr-4 font-medium",
                    column.type !== "text" && "text-right"
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSort({
                        column: index,
                        direction:
                          active && sort.direction === "asc" ? "desc" : "asc",
                      })
                    }
                    className="font-medium hover:text-fg"
                  >
                    {column.label}
                    <span aria-hidden="true">
                      {active ? (sort.direction === "asc" ? " ▲" : " ▼") : ""}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={table.columns.length}
                className="py-2 text-fg-subtle"
              >
                No data
              </td>
            </tr>
          )}
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line-subtle">
              {row.map((cell, index) => (
                <td
                  key={table.columns[index].key}
                  className={cx(
                    "py-2 pr-4",
                    table.columns[index].type !== "text" &&
                      "text-right tabular-nums",
                    cell === null && "text-fg-subtle"
                  )}
                >
                  {formatCell(cell, table.columns[index].type)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
