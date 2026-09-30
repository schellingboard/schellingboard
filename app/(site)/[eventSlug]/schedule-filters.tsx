"use client";
import type { Ref } from "react";
import clsx from "clsx";
import { ArrowUpIcon } from "@heroicons/react/20/solid";
import { SearchInput } from "@/app/search-input";

export function ScheduleFilters(props: {
  statusRef?: Ref<HTMLDivElement>;
  search: string;
  onSearchChange: (search: string) => void;
  /** How many entries are shown out of how many, or null when nothing narrows them. */
  count: { shown: number; total: number } | null;
  onShowAll: () => void;
  onBackToTop: () => void;
}) {
  const { statusRef, search, onSearchChange, count, onShowAll, onBackToTop } =
    props;
  const active = search.trim() === "" ? [] : [`"${search.trim()}"`];
  return (
    <>
      <div
        className={clsx("bg-surface", !count && "border-b border-line-subtle")}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2 px-2 py-2">
          <SearchInput
            className="w-full sm:w-auto sm:flex-1"
            // text-base below sm: iOS zooms into inputs with smaller text.
            inputClassName="h-9 rounded-md border border-line bg-surface-raised px-3 text-base sm:text-sm placeholder-fg-subtle focus:outline-0 focus:ring-2 focus:ring-brand-accent focus:border-transparent"
            placeholder="Search sessions"
            aria-label="Search sessions"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onClear={() => onSearchChange("")}
          />
        </div>
      </div>
      {/* Only this line stays pinned: a narrowed-down list always says so,
          without the whole bar taking up a phone's screen. */}
      {count && (
        <div
          ref={statusRef}
          className="sticky top-0 z-20 border-b border-line-subtle bg-surface"
        >
          <p className="mx-auto flex max-w-3xl items-center gap-1 px-2 py-1.5 text-xs text-fg-subtle">
            <button
              type="button"
              onClick={onBackToTop}
              className="flex min-w-0 items-center gap-1 hover:text-fg-muted"
            >
              <span className="truncate">
                {[`Showing ${count.shown} of ${count.total}`, ...active].join(
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
