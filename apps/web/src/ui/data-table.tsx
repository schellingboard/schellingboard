import { useEffect, useRef, useState, type ReactNode } from "react";
import { SearchInput } from "./search-input";
import { SEARCH_DEBOUNCE_MS } from "./use-debounced";

export type Column<T> = {
  header: ReactNode;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

/** Selection state is the caller's, so it can drive a bulk action bar. */
export type Selection<T> = {
  selectedKeys: Set<string>;
  onToggleRow: (key: string) => void;
  onToggleAllOnPage: (pageKeys: string[], shouldSelectAll: boolean) => void;
  rowLabel: (row: T) => string;
};

/** The URL params a search sets: the query, and back to the first page. */
export const searchParamUpdates = (query: string) => ({
  q: query || null,
  page: null,
});

const pagerButton =
  "px-3 py-1 rounded-md border border-line bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-sunken";

/** Assign/remove/clear bar for a selection; it keeps its space while hidden so the table does not jump. */
export function BulkActionsBar({
  selectedCount,
  isPending,
  onAssign,
  onRemove,
  onClear,
}: {
  selectedCount: number;
  isPending: boolean;
  onAssign: () => void;
  onRemove: () => void;
  onClear: () => void;
}) {
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={`flex flex-wrap items-center gap-3 rounded-md border border-line bg-surface-sunken px-3 py-2 text-sm ${
        selectedCount === 0 ? "invisible" : ""
      }`}
    >
      <span className="font-medium text-fg-muted">
        {selectedCount} selected
      </span>
      <button
        type="button"
        onClick={onAssign}
        disabled={isPending}
        className="px-3 py-1 rounded-md border border-line-strong bg-surface-inverse text-fg-inverse disabled:opacity-50 hover:bg-surface-inverse-hover"
      >
        Assign selected
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={isPending}
        className="px-3 py-1 rounded-md border border-line bg-surface-raised text-fg-muted disabled:opacity-50 hover:bg-surface-sunken"
      >
        Remove selected
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-3 py-1 rounded-md text-fg-muted hover:text-fg"
      >
        Clear
      </button>
    </div>
  );
}

function SearchForm({
  query,
  placeholder,
  onSearch,
}: {
  query: string;
  placeholder: string;
  onSearch: (query: string, options: { replace: boolean }) => void;
}) {
  const [draft, setDraft] = useState(query);
  const [sent, setSent] = useState(query);
  const [seenQuery, setSeenQuery] = useState(query);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Only back/forward moves the query under the box; replacing the draft when
  // one of its own searches lands would eat whatever was typed meanwhile.
  if (query !== seenQuery) {
    setSeenQuery(query);
    if (query !== sent) {
      setDraft(query);
      setSent(query);
    }
  }

  const search = (value: string) => {
    clearTimeout(timer.current);
    const trimmed = value.trim();
    if (trimmed === sent) return;
    setSent(trimmed);
    onSearch(trimmed, { replace: sent !== "" && trimmed !== "" });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        search(draft);
      }}
      role="search"
    >
      <SearchInput
        name="q"
        value={draft}
        onChange={(event) => {
          const value = event.target.value;
          setDraft(value);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => search(value), SEARCH_DEBOUNCE_MS);
        }}
        onClear={() => {
          setDraft("");
          search("");
        }}
        placeholder={placeholder}
        aria-label="Search"
        inputClassName="px-3 py-1.5 text-sm rounded-md border border-line focus:border-line-strong focus:outline-none"
      />
    </form>
  );
}

export type DataTableProps<T> = {
  rows: T[];
  rowKey: (row: T) => string;
  total: number;
  page: number;
  pageSize: number;
  searchQuery: string;
  /**
   * `replace` is true when refining a search that already started: the page
   * should replace its history entry, or Back would unwind the query a few
   * letters at a time. Apply the change with `searchParamUpdates`.
   */
  onSearch: (query: string, options: { replace: boolean }) => void;
  onPage: (page: number) => void;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  bulkBar?: ReactNode;
  emptyMessage?: ReactNode;
  /** "when-paginated" drops the count-and-pager footer from a list that fits on one page. */
  paginationFooter?: "always" | "when-paginated";
} & (
  | {
      columns: Column<T>[];
      selection?: Selection<T>;
      mobileCard: (row: T) => ReactNode;
      listItem?: undefined;
    }
  | {
      // Each row renders as a rich list item on every viewport (rows that
      // don't fit a column layout, such as inline edit forms).
      columns?: undefined;
      selection?: undefined;
      mobileCard?: undefined;
      listItem: (row: T) => ReactNode;
    }
);

/** A searchable, paged list that is a table on wide screens and cards on narrow ones. */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  total,
  page,
  pageSize,
  searchQuery,
  onSearch,
  onPage,
  searchPlaceholder = "Search…",
  toolbar,
  bulkBar,
  selection,
  mobileCard,
  listItem,
  emptyMessage = "Nothing to show.",
  paginationFooter = "always",
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageKeys = rows.map(rowKey);
  const allOnPageSelected =
    pageKeys.length > 0 &&
    pageKeys.every((k) => selection?.selectedKeys.has(k));
  const someOnPageSelected = pageKeys.some((k) =>
    selection?.selectedKeys.has(k)
  );
  const selectAllRef = (el: HTMLInputElement | null) => {
    if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchForm
          query={searchQuery}
          placeholder={searchPlaceholder}
          onSearch={onSearch}
        />
        {toolbar}
      </div>

      {bulkBar}

      {rows.length === 0 ? (
        <p className="text-sm text-fg-subtle">{emptyMessage}</p>
      ) : listItem ? (
        <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
          {rows.map((row) => (
            <li key={rowKey(row)} className="py-3">
              {listItem(row)}
            </li>
          ))}
        </ul>
      ) : (
        <>
          <table className="hidden w-full text-sm sm:table">
            <thead>
              <tr className="border-b border-line-subtle text-left text-fg-muted">
                {selection && (
                  <th className="py-2 pr-4 font-medium">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      checked={allOnPageSelected}
                      aria-label="Select all"
                      onChange={() =>
                        selection.onToggleAllOnPage(
                          pageKeys,
                          !allOnPageSelected
                        )
                      }
                      className="h-4 w-4 cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`py-2 pr-4 font-medium ${col.headerClassName ?? ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)} className="border-b border-line-subtle">
                  {selection && (
                    <td className="py-2 pr-4">
                      <input
                        type="checkbox"
                        checked={selection.selectedKeys.has(rowKey(row))}
                        aria-label={`Select ${selection.rowLabel(row)}`}
                        onChange={() => selection.onToggleRow(rowKey(row))}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={`py-2 pr-4 ${col.cellClassName ?? ""}`}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="space-y-3 sm:hidden">
            {rows.map((row) => (
              <li
                key={rowKey(row)}
                className="flex items-start gap-3 rounded-md border border-line-subtle p-3"
              >
                {selection && (
                  <input
                    type="checkbox"
                    checked={selection.selectedKeys.has(rowKey(row))}
                    aria-label={`Select ${selection.rowLabel(row)}`}
                    onChange={() => selection.onToggleRow(rowKey(row))}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer"
                  />
                )}
                <div className="min-w-0 flex-1">{mobileCard(row)}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      {(paginationFooter === "always" || totalPages > 1) && (
        <div className="flex items-center justify-between text-sm text-fg-muted">
          <span>
            {total === 0
              ? "0 results"
              : `${total} result${total === 1 ? "" : "s"}`}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className={pagerButton}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
              className={pagerButton}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
