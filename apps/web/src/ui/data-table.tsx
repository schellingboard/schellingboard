import { useEffect, useRef, useState, type ReactNode } from "react";
import { DEFAULT_PAGE_SIZE, Pager, type PageSize } from "./pager";
import { SearchInput } from "./search-input";
import { SEARCH_DEBOUNCE_MS } from "./use-debounced";
import { Trans } from "@lingui/react/macro";
import { plural, t } from "@lingui/core/macro";

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
      aria-label={t`Bulk actions`}
      className={`flex flex-wrap items-center gap-3 rounded-md border border-line bg-surface-sunken px-3 py-2 text-sm ${
        selectedCount === 0 ? "invisible" : ""
      }`}
    >
      <span className="font-medium text-fg-muted">
        {plural(selectedCount, { one: "# selected", other: "# selected" })}
      </span>
      <button
        type="button"
        onClick={onAssign}
        disabled={isPending}
        className="px-3 py-1 rounded-md border border-line-strong bg-surface-inverse text-fg-inverse disabled:opacity-50 hover:bg-surface-inverse-hover"
      >
        <Trans>Assign selected</Trans>
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={isPending}
        className="px-3 py-1 rounded-md border border-line bg-surface-raised text-fg-muted disabled:opacity-50 hover:bg-surface-sunken"
      >
        <Trans>Remove selected</Trans>
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-3 py-1 rounded-md text-fg-muted hover:text-fg"
      >
        <Trans context="Bulk actions: clear the selection">Clear</Trans>
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
        aria-label={t`Search`}
        inputClassName="px-3 py-1.5 text-base sm:text-sm rounded-md border border-line focus:border-line-strong focus:outline-none"
      />
    </form>
  );
}

export type DataTableProps<T> = {
  rows: T[];
  rowKey: (row: T) => string;
  total: number;
  page: number;
  pageSize: PageSize;
  searchQuery: string;
  /**
   * `replace` is true when refining a search that already started: the page
   * should replace its history entry, or Back would unwind the query a few
   * letters at a time. Apply the change with `searchParamUpdates`.
   */
  onSearch: (query: string, options: { replace: boolean }) => void;
  onPage: (page: number) => void;
  /** Without it, the pager offers no rows-per-page choice. */
  onPageSize?: (size: PageSize) => void;
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
  onPageSize,
  searchPlaceholder = t`Search…`,
  toolbar,
  bulkBar,
  selection,
  mobileCard,
  listItem,
  emptyMessage = t`Nothing to show.`,
  paginationFooter = "always",
}: DataTableProps<T>) {
  const totalPages =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(total / pageSize));
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
                      aria-label={t`Select all`}
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
                        aria-label={t`Select ${selection.rowLabel(row)}`}
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
                    aria-label={t`Select ${selection.rowLabel(row)}`}
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

      {(paginationFooter === "always" ||
        totalPages > 1 ||
        (onPageSize !== undefined && pageSize !== DEFAULT_PAGE_SIZE)) && (
        <Pager
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          total={total}
          onPage={onPage}
          onPageSize={onPageSize}
        />
      )}
    </div>
  );
}
