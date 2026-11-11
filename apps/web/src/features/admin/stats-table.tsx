import { useState } from "react";
import { paramsUpdater } from "../../ui/list-paging";
import { usePaging } from "../../ui/use-paging";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { cx } from "../../ui/cx";
import { SearchInput } from "../../ui/search-input";

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

const SEARCH_FROM = 10;

const plain = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** The rows with a text cell holding the query, in their order. */
export function searchRows(rows: StatsTable["rows"], query: string) {
  const needle = plain(query.trim());
  if (!needle) return rows;
  return rows.filter((row) =>
    row.some((cell) => typeof cell === "string" && plain(cell).includes(needle))
  );
}

export function SortableStatsTable({
  table,
  labelledBy,
}: {
  table: StatsTable;
  labelledBy: string;
}) {
  const [sort, setSort] = useState<{
    column: number;
    direction: "asc" | "desc";
  } | null>(null);
  const [query, setQuery] = useState("");
  const [paging, setPaging] = useState(new URLSearchParams());
  const resetPage = () =>
    setPaging((current) => {
      const next = new URLSearchParams(current);
      next.delete("page");
      return next;
    });

  const matching = searchRows(table.rows, query);
  const sorted = sort
    ? sortRows(matching, sort.column, sort.direction)
    : matching;
  const {
    visible: rows,
    first,
    pager,
    top,
  } = usePaging<StatsTable["rows"][number], HTMLDivElement>(
    sorted,
    paging,
    paramsUpdater(paging, (next) => setPaging(next))
  );
  const searchable = table.rows.length > SEARCH_FROM;

  return (
    <div className="space-y-3">
      {searchable && (
        <SearchInput
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            resetPage();
          }}
          onClear={() => {
            setQuery("");
            resetPage();
          }}
          aria-label={`Search ${table.title}`}
          placeholder="Search…"
          className="max-w-xs"
          inputClassName="rounded-md border border-line bg-surface-raised px-3 py-1.5 text-base sm:text-sm focus:border-line-strong focus:outline-none"
        />
      )}
      <div ref={top} className="overflow-x-auto">
        <table aria-labelledby={labelledBy} className="w-full text-sm">
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
                      "py-2 pr-4 align-bottom font-medium",
                      column.type !== "text" && "text-right",
                      index === 0 && "sticky left-0 bg-surface"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSort({
                          column: index,
                          direction:
                            active && sort.direction === "asc" ? "desc" : "asc",
                        });
                        resetPage();
                      }}
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
                  {query ? "Nothing matches." : "No data"}
                </td>
              </tr>
            )}
            {rows.map((row, rowIndex) => (
              <tr
                key={first + rowIndex}
                className="border-b border-line-subtle"
              >
                {row.map((cell, index) => {
                  const type = table.columns[index].type;
                  return (
                    <td
                      key={table.columns[index].key}
                      className={cx(
                        "py-2 pr-4",
                        type === "text"
                          ? "min-w-32 max-w-sm"
                          : "whitespace-nowrap text-right tabular-nums",
                        cell === null && "text-fg-subtle",
                        index === 0 && "sticky left-0 bg-surface"
                      )}
                    >
                      {formatCell(cell, type)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pager}
    </div>
  );
}
