"use client";
import type { ReactNode, RefObject } from "react";
import type { Location } from "@/db/repositories/interfaces";
import type { DayWithSessions } from "../context";
import { DayAgenda } from "./day-agenda";
import { DayFoldBar } from "./day-fold-bar";
import { ScheduleFilters } from "./schedule-filters";
import { useScheduleSearch } from "./use-schedule-search";
import Footer from "@/app/footer";

export function AgendaView(props: {
  days: DayWithSessions[];
  locations: Location[];
  eventSlug: string;
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
    eventSlug,
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
  const { filtering, entries, statusHeight, barProps } = useScheduleSearch({
    days,
    locations,
    search,
    debouncedSearch,
    onSearchChange,
    scrollerRef,
  });

  return (
    <div
      data-testid="schedule-scroll"
      ref={scrollerRef}
      className="flex-1 w-full overflow-auto flex flex-col items-stretch"
    >
      {toolbar}
      <ScheduleFilters {...barProps} />
      <div className="flex flex-col gap-4 w-full lg:grow">
        {entries.map(({ day, sessions, meetings }) => (
          <div key={day.id}>
            {/* A search or filter looks through past days too, so it unfolds them. */}
            {!filtering && defaultFoldedDayIds.has(day.id) && (
              <div className="max-w-3xl mx-auto">
                <DayFoldBar
                  day={day}
                  timezone={timezone}
                  folded={isFolded(day.id)}
                  onToggle={() => onToggleFold(day.id)}
                />
              </div>
            )}
            {(filtering || !isFolded(day.id)) && (
              <DayAgenda
                day={day}
                sessions={sessions}
                meetings={meetings}
                locations={locations}
                eventSlug={eventSlug}
                filtering={filtering}
                stickyTop={statusHeight}
              />
            )}
          </div>
        ))}
      </div>
      <div className="lg:sticky lg:bottom-0">
        <Footer inline />
      </div>
    </div>
  );
}
