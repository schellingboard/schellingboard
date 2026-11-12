import type { RefObject } from "react";
import { plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

export const PAGE_SIZES = [25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 50;
const ALL = "all";

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
  showTotal = true,
  more = false,
  disabled = false,
  listTop,
}: {
  page: number;
  totalPages: number;
  pageSize: PageSize;
  total: number;
  onPage: (page: number) => void;
  onPageSize?: (size: PageSize) => void;
  /** False where the list already shows its count above. */
  showTotal?: boolean;
  /** More rows exist than are counted, so the totals read "50+". */
  more?: boolean;
  /** Locks every control, e.g. while the next rows load. */
  disabled?: boolean;
  /** Scrolled into view on a page change, as the list is above this pager. */
  listTop?: RefObject<HTMLElement | null>;
}) {
  const goTo = (next: number) => {
    onPage(next);
    listTop?.current?.scrollIntoView({ block: "start" });
  };
  return (
    <nav
      aria-label={t`Pagination`}
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-fg-muted"
    >
      {showTotal && (
        <span>
          {more
            ? plural(total, { one: "#+ result", other: "#+ results" })
            : plural(total, { one: "# result", other: "# results" })}
        </span>
      )}
      {onPageSize && (
        <label className="flex items-center gap-2">
          <Trans>Rows per page</Trans>
          <select
            value={String(pageSize)}
            disabled={disabled}
            onChange={(e) =>
              onPageSize(e.target.value === ALL ? ALL : Number(e.target.value))
            }
            className="rounded-md border border-line bg-surface-raised py-1 pl-2 pr-7 text-base text-fg sm:text-sm"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
            <option value={ALL}>
              {t({ message: "All", context: "Rows per page: every row" })}
            </option>
          </select>
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(1)}
          disabled={disabled || page <= 1}
          aria-label={t`First page`}
          className={BUTTON}
        >
          <Trans context="Pager: first page">First</Trans>
        </button>
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={disabled || page <= 1}
          aria-label={t`Previous page`}
          className={BUTTON}
        >
          <Trans>Prev</Trans>
        </button>
        <span className="sm:hidden">
          {more ? (
            <Trans>
              Page {page} of {totalPages}+
            </Trans>
          ) : (
            <Trans>
              Page {page} of {totalPages}
            </Trans>
          )}
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
                onClick={() => goTo(entry)}
                aria-label={t`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                disabled={disabled || entry === page}
                className={`${BUTTON} ${entry === page ? "bg-surface-sunken font-semibold" : ""}`}
              >
                {entry}
              </button>
            )
          )}
        </span>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={disabled || page >= totalPages}
          aria-label={t`Next page`}
          className={BUTTON}
        >
          <Trans>Next</Trans>
        </button>
        <button
          type="button"
          onClick={() => goTo(totalPages)}
          disabled={disabled || page >= totalPages}
          aria-label={t`Last page`}
          className={BUTTON}
        >
          <Trans context="Pager: last page">Last</Trans>
        </button>
      </div>
    </nav>
  );
}
