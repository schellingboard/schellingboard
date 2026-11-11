import type { ReactNode } from "react";

// DOM order is the tab order: search, filters, sort.
export function ListToolbar({
  search,
  filters,
  sort,
  count,
}: {
  search: ReactNode;
  filters: ReactNode;
  sort: ReactNode;
  count?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 [grid-template-areas:'search_search'_'filters_filters'_'count_sort'] md:[grid-template-areas:'search_sort'_'filters_count']">
      <div className="min-w-0 [grid-area:search]">{search}</div>
      <div
        role="group"
        aria-label="Filters"
        className="flex min-w-0 flex-wrap items-center gap-2 [grid-area:filters]"
      >
        {filters}
      </div>
      <div className="justify-self-end text-sm text-fg-muted [grid-area:sort]">
        {sort}
      </div>
      <p
        aria-live="polite"
        className="text-sm text-fg-subtle [grid-area:count] md:justify-self-end"
      >
        {count}
      </p>
    </div>
  );
}
