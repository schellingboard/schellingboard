"use client";
import {
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useSearchParams } from "next/navigation";
import type { Location } from "@/db/repositories/interfaces";
import { EventContext, UserContext, type DayWithSessions } from "../context";
import { meetingsForDay } from "@/utils/meeting-column";
import {
  meetingMatchesSearch,
  sessionMatchesSearch,
} from "@/utils/schedule-search";
import {
  parseScheduleFilters,
  SCHEDULE_FILTERS,
  serializeScheduleFilters,
  sessionPassesFilters,
  type ScheduleFilter,
} from "@/utils/schedule-filters";
import { DayAgenda } from "./day-agenda";
import { DayFoldBar } from "./day-fold-bar";
import { ScheduleFilters } from "./schedule-filters";
import { useMyMeetings } from "./use-meetings";
import Footer from "@/app/footer";

const NO_FILTERS: ScheduleFilter[] = [];

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
  const searchParams = useSearchParams();
  const { user } = useContext(UserContext);
  const { rsvpdForSession } = useContext(EventContext);
  const { meetings } = useMyMeetings();
  const [chosenFilters, setChosenFilters] = useState(() =>
    parseScheduleFilters(searchParams.get("filter"))
  );
  const filters = user ? chosenFilters : NO_FILTERS;
  const searching = debouncedSearch.trim() !== "";
  const filtering = searching || filters.length > 0;
  const setFilters = (next: ScheduleFilter[]) => {
    setChosenFilters(next);
    const params = new URLSearchParams(window.location.search);
    const serialized = serializeScheduleFilters(next);
    if (serialized) params.set("filter", serialized);
    else params.delete("filter");
    // Not router.replace: the filter is the browser's alone, and a server
    // round trip per tap lands late enough to race the next one.
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  const entries = useMemo(() => {
    const locParams = searchParams?.getAll("loc") ?? [];
    const locationsFromParams = locations.filter((loc) =>
      locParams.includes(loc.name)
    );
    const includedLocations =
      locationsFromParams.length === 0 ? locations : locationsFromParams;
    return days.map((day) => {
      const sessions = day.sessions.filter((session) =>
        includedLocations.some((loc) =>
          session.locations.some((l) => l.id === loc.id)
        )
      );
      const dayMeetings = meetingsForDay(meetings ?? [], day);
      return {
        day,
        total: sessions.filter((s) => !s.blocker).length + dayMeetings.length,
        sessions: filtering
          ? sessions.filter(
              (s) =>
                !s.blocker &&
                (!searching || sessionMatchesSearch(s, debouncedSearch)) &&
                sessionPassesFilters(filters, {
                  rsvpd: rsvpdForSession(s.id),
                  hosting: s.hosts.some((h) => h.id === user),
                })
            )
          : sessions,
        // The viewer's own 1-on-1s are theirs under every filter.
        meetings: searching
          ? dayMeetings.filter((m) => meetingMatchesSearch(m, debouncedSearch))
          : dayMeetings,
      };
    });
  }, [
    days,
    locations,
    searchParams,
    meetings,
    filtering,
    searching,
    debouncedSearch,
    filters,
    rsvpdForSession,
    user,
  ]);

  const count = filtering
    ? entries.reduce(
        (acc, e) => ({
          shown: acc.shown + e.sessions.length + e.meetings.length,
          total: acc.total + e.total,
        }),
        { shown: 0, total: 0 }
      )
    : null;

  const [statusLine, setStatusLine] = useState<HTMLDivElement | null>(null);
  const [measuredHeight, setStatusHeight] = useState(0);
  const statusHeight = statusLine ? measuredHeight : 0;
  useLayoutEffect(() => {
    if (!statusLine) return;
    const observer = new ResizeObserver(() =>
      setStatusHeight(statusLine.offsetHeight)
    );
    observer.observe(statusLine);
    return () => observer.disconnect();
  }, [statusLine]);

  return (
    <div
      data-testid="schedule-scroll"
      ref={scrollerRef}
      className="flex-1 w-full overflow-auto flex flex-col items-stretch"
    >
      {toolbar}
      <ScheduleFilters
        statusRef={setStatusLine}
        search={search}
        onSearchChange={onSearchChange}
        filters={
          user
            ? SCHEDULE_FILTERS.map((f) => ({
                ...f,
                active: filters.includes(f.value),
              }))
            : null
        }
        onToggleFilter={(value) =>
          setFilters(
            filters.includes(value)
              ? filters.filter((f) => f !== value)
              : [...filters, value]
          )
        }
        count={count}
        onShowAll={() => {
          onSearchChange("");
          setFilters([]);
        }}
        onBackToTop={() =>
          scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        }
      />
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
