export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;
export type PageSize = number | "all";

const BUTTON =
  "px-3 py-1 rounded-md border border-line bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-sunken";

export function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
  if (page >= totalPages - 3)
    return [1, "…", ...Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)];
  return [1, "…", page - 1, page, page + 1, "…", totalPages];
}

export function Pager({
  page,
  totalPages,
  pageSize,
  total,
  onPage,
  onPageSize,
}: {
  page: number;
  totalPages: number;
  pageSize: PageSize;
  total: number;
  onPage: (page: number) => void;
  onPageSize?: (size: PageSize) => void;
}) {
  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-fg-muted"
    >
      <span>
        {total === 0 ? "0 results" : `${total} result${total === 1 ? "" : "s"}`}
      </span>
      {onPageSize && (
        <label className="flex items-center gap-2">
          Rows per page
          <select
            value={String(pageSize)}
            onChange={(e) =>
              onPageSize(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
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
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(1)}
          disabled={page <= 1}
          aria-label="First page"
          className={BUTTON}
        >
          First
        </button>
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={BUTTON}
        >
          Prev
        </button>
        <span className="sm:hidden">
          Page {page} of {totalPages}
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          {pageWindow(page, totalPages).map((entry, i) =>
            entry === "…" ? (
              <span key={`gap-${i}`} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPage(entry)}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                disabled={entry === page}
                className={`${BUTTON} ${entry === page ? "bg-surface-sunken font-semibold" : ""}`}
              >
                {entry}
              </button>
            )
          )}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={BUTTON}
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => onPage(totalPages)}
          disabled={page >= totalPages}
          aria-label="Last page"
          className={BUTTON}
        >
          Last
        </button>
      </div>
    </nav>
  );
}
