"use client";
import { useState, type ReactNode, type RefObject } from "react";
import type { Guest, Location } from "@/db/repositories/interfaces";
import type { DayWithSessions } from "../context";
import { DayGrid } from "./day-grid";
import { DayFoldBar } from "./day-fold-bar";
import { ScheduleFilters } from "./schedule-filters";
import { ScheduleMatchContext, useScheduleSearch } from "./use-schedule-search";
import Footer from "@/app/footer";

export function GridView(props: {
  days: DayWithSessions[];
  locations: Location[];
  guests: Guest[];
  timezone: string;
  toolbar: ReactNode;
  scrollerRef: RefObject<HTMLDivElement | null>;
  defaultFoldedDayIds: Set<string>;
  isFolded: (dayId: string) => boolean;
  onToggleFold: (dayId: string) => void;
  search: string;
  debouncedSearch: string;
  onSearchChange: (search: string) => void;
}) {
  const {
    days,
    locations,
    guests,
    timezone,
    toolbar,
    scrollerRef,
    defaultFoldedDayIds,
    isFolded,
    onToggleFold,
    search,
    debouncedSearch,
    onSearchChange,
  } = props;
  const { match, filtering, entries, statusHeight, barProps } =
    useScheduleSearch({
      days,
      locations,
      search,
      debouncedSearch,
      onSearchChange,
      scrollerRef,
    });
  // Days without a match, opened anyway while searching or filtering.
  const [openedEmpty, setOpenedEmpty] = useState<Set<string>>(() => new Set());
  const toggleEmpty = (dayId: string) =>
    setOpenedEmpty((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });

  return (
    <div
      data-testid="schedule-scroll"
      ref={scrollerRef}
      // `grid` with a single minmax(max-content, 1fr) column (rather than
      // block flow) so the toolbar, fold bars and footer stretch to the
      // widest day's grid when it overflows — instead of falling short when
      // scrolled horizontally — yet still fill the viewport when the grid is
      // narrower than it.
      // `cursor` inherits, so links/buttons (session cells, fold toggles, …)
      // are reset to their normal cursor rather than showing the grab hand.
      className="flex-1 w-full overflow-auto cursor-grab grid content-start [&_a]:cursor-pointer [&_button]:cursor-pointer"
      style={{ gridTemplateColumns: "minmax(max-content, 1fr)" }}
    >
      {toolbar}
      <ScheduleFilters {...barProps} layout="grid" />
      <ScheduleMatchContext value={match}>
        {entries.map(({ day, sessions, meetings }) => {
          const empty = filtering && sessions.length + meetings.length === 0;
          const foldable = filtering ? empty : defaultFoldedDayIds.has(day.id);
          const folded = filtering
            ? empty && !openedEmpty.has(day.id)
            : isFolded(day.id);
          return (
            <div key={day.id} className="contents">
              {foldable && (
                <DayFoldBar
                  day={day}
                  timezone={timezone}
                  folded={folded}
                  onToggle={() =>
                    filtering ? toggleEmpty(day.id) : onToggleFold(day.id)
                  }
                  reason={filtering ? "no matches" : undefined}
                />
              )}
              {!folded && (
                <DayGrid
                  day={day}
                  locations={locations}
                  guests={guests}
                  stickyTop={statusHeight}
                />
              )}
            </div>
          );
        })}
      </ScheduleMatchContext>
      <Footer inline />
    </div>
  );
}
