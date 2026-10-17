"use client";
import type { Ref } from "react";
import clsx from "clsx";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { SearchInput } from "@/app/search-input";
import type { ScheduleFilter } from "@/utils/schedule-filters";

export function ScheduleFilters(props: {
  statusRef?: Ref<HTMLDivElement>;
  /** "grid": held at the left edge while the grid scrolls sideways under it. */
  layout?: "centered" | "grid";
  search: string;
  onSearchChange: (search: string) => void;
  /** Null when there is no viewer for "mine" to mean. */
  filters: { value: ScheduleFilter; label: string; active: boolean }[] | null;
  onToggleFilter: (value: ScheduleFilter) => void;
  /** How many entries match out of how many, or null when nothing narrows them. */
  count: { matching: number; total: number } | null;
  onShowAll: () => void;
  onBackToTop: () => void;
  /** Where every match stays in place, Enter steps to the next one. */
  onStep?: (direction: 1 | -1) => void;
}) {
  const {
    layout = "centered",
    statusRef,
    search,
    onSearchChange,
    filters,
    onToggleFilter,
    count,
    onShowAll,
    onBackToTop,
    onStep,
  } = props;
  const active = [
    ...(filters ?? []).filter((f) => f.active).map((f) => f.label),
    ...(search.trim() === "" ? [] : [`"${search.trim()}"`]),
  ];
  const width =
    layout === "grid"
      ? "sticky left-0 w-[100dvw] max-w-3xl"
      : "mx-auto max-w-3xl";
  return (
    <>
      <div
        className={clsx("bg-surface", !count && "border-b border-line-subtle")}
      >
        <div
          className={clsx(width, "flex flex-wrap items-center gap-2 px-2 py-2")}
        >
          <SearchInput
            className="w-full sm:w-auto sm:flex-1"
            // text-base below sm: iOS zooms into inputs with smaller text.
            inputClassName="h-9 rounded-md border border-line bg-surface-raised px-3 text-base sm:text-sm placeholder-fg-subtle focus:outline-0 focus:ring-2 focus:ring-brand-accent focus:border-transparent"
            placeholder="Search sessions"
            aria-label="Search sessions"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onClear={() => onSearchChange("")}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || !onStep || !count?.matching) return;
              event.preventDefault();
              onStep(event.shiftKey ? -1 : 1);
            }}
          />
          {filters && (
            <div
              role="group"
              aria-label="Filter sessions"
              className="flex flex-wrap gap-2"
            >
              {filters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={f.active}
                  onClick={() => onToggleFilter(f.value)}
                  className={clsx(
                    "h-9 rounded-md px-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
                    f.active
                      ? "bg-info text-on-info hover:bg-info-hover"
                      : "bg-surface-muted text-fg-muted hover:bg-surface-hover"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Only this line stays pinned: a narrowed-down list always says so,
          without the whole bar taking up a phone's screen. */}
      {count && (
        <div
          ref={statusRef}
          className="sticky top-0 z-30 border-b border-line-subtle bg-surface"
        >
          <p
            className={clsx(
              width,
              "flex items-center gap-1 px-2 py-1.5 text-xs text-fg-subtle"
            )}
          >
            <button
              type="button"
              onClick={onBackToTop}
              className="flex min-w-0 items-center gap-1 hover:text-fg-muted"
            >
              <span className="truncate">
                {[`${count.matching} of ${count.total} match`, ...active].join(
                  " · "
                )}
              </span>
              <ArrowUpIcon aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span className="sr-only">, back to the search</span>
            </button>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={onShowAll}
              className="shrink-0 font-semibold text-brand-fg hover:text-brand-fg-hover"
            >
              Show all
            </button>
          </p>
        </div>
      )}
    </>
  );
}
