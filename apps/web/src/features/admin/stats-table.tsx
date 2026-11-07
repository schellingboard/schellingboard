import { useState } from "react";
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

const PAGE_SIZES = [25, 50, 100];
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

const pagerButton =
  "rounded-md border border-line bg-surface-raised px-3 py-1 hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40";

export function SortableStatsTable({ table }: { table: StatsTable }) {
  const [sort, setSort] = useState<{
    column: number;
    direction: "asc" | "desc";
  } | null>(null);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  const matching = searchRows(table.rows, query);
  const sorted = sort
    ? sortRows(matching, sort.column, sort.direction)
    : matching;
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const first = current === 1 ? 0 : (current - 1) * pageSize;
  const rows = sorted.slice(first, first + pageSize);
  const searchable = table.rows.length > SEARCH_FROM;
  const pageable = table.rows.length > PAGE_SIZES[0];
  const headingId = `stats-${table.id}`;

  return (
    <div className="space-y-3">
      {searchable && (
        <SearchInput
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          onClear={() => {
            setQuery("");
            setPage(1);
          }}
          aria-label={`Search ${table.title}`}
          placeholder="Search…"
          className="max-w-xs"
          inputClassName="rounded-md border border-line bg-surface-raised px-3 py-1.5 text-base sm:text-sm focus:border-line-strong focus:outline-none"
        />
      )}
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
                        setPage(1);
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
      {(pageable || query) && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-fg-muted">
          <span>
            {query
              ? `${sorted.length} of ${table.rows.length} match`
              : `${sorted.length === 0 ? 0 : first + 1}–${first + rows.length} of ${sorted.length}`}
          </span>
          {pageable && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2">
                Rows per page
                <select
                  value={pageSize === Infinity ? "all" : String(pageSize)}
                  onChange={(e) => {
                    setPageSize(
                      e.target.value === "all"
                        ? Infinity
                        : Number(e.target.value)
                    );
                    setPage(1);
                  }}
                  className="rounded-md border border-line bg-surface-raised py-1 pl-2 pr-7 text-base text-fg sm:text-sm"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                  <option value="all">All</option>
                </select>
              </label>
              {pages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPage(current - 1)}
                    disabled={current <= 1}
                    aria-label="Previous page"
                    className={pagerButton}
                  >
                    Prev
                  </button>
                  <span>
                    Page {current} of {pages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(current + 1)}
                    disabled={current >= pages}
                    aria-label="Next page"
                    className={pagerButton}
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
