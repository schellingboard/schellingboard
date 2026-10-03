"use client";
import { ScheduleToolbar, scheduleView } from "./schedule-toolbar";
import { GridView } from "./grid-view";
import { useSearchParams } from "next/navigation";
import { AgendaView } from "./agenda-view";
import { useState, useContext, useRef } from "react";
import { EventContext, useSlotIncrement } from "../context";
import { getDefaultFoldedDayIds } from "@/utils/schedule-fold";
import { getNowOffsetPx } from "@/utils/slots";
import { useDebouncedSearch } from "@/utils/hooks";
import { KioskController, useKioskMode } from "./kiosk";
import { SessionModal } from "./session-modal";
import { MeetingModalFromUrl } from "./meeting-modal";
import { MeetingsProvider } from "./use-meetings";
import { useDragToPan } from "./use-drag-to-pan";
import { PullToRefresh } from "./pull-to-refresh";
import { useScrollRestoration } from "./use-scroll-restoration";

export function EventDisplay() {
  const { event, days, locations, guests, now } = useContext(EventContext);
  const searchParams = useSearchParams();
  const view = scheduleView(searchParams);
  const viewSession = searchParams.get("viewSession");
  const kiosk = useKioskMode();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const [unfoldedDayIds, setUnfoldedDayIds] = useState<Set<string>>(
    () => new Set()
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slotIncrement = useSlotIncrement();
  useDragToPan(scrollerRef, view === "grid");
  // Per view: the grid and the agenda have nothing in common to scroll to.
  useScrollRestoration(scrollerRef, `${event?.slug ?? ""}:${view}`);

  if (!event) return <div>No event data available</div>;

  const daysForEvent = days.filter((day) => day.eventId === event.id);
  const defaultFoldedDayIds = getDefaultFoldedDayIds(daysForEvent, now);
  const isFolded = (dayId: string) =>
    defaultFoldedDayIds.has(dayId) && !unfoldedDayIds.has(dayId);
  const toggleDayFold = (dayId: string) =>
    setUnfoldedDayIds((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  const locationsForEvent = locations;

  // "Now" only makes sense while the event is running: it scrolls to the now
  // line, drawn on the day the current moment falls inside.
  const nowIsOnSchedule = daysForEvent.some(
    (day) => getNowOffsetPx(day, now, slotIncrement) !== null
  );
  const toolbar = (
    <ScheduleToolbar event={event} showJumpToNow={nowIsOnSchedule} />
  );

  // Both views own the viewport below the nav bar via the same fixed frame, so
  // the toolbar rests in the same spot and doesn't jump when switching views.
  // The frame's inner container is the only scroll surface; the toolbar lives
  // inside it (as the first item) so it scrolls away with the content, leaving
  // only the sticky room headers pinned in the grid view. globals.css locks
  // window scrolling and hides the site footer while [data-schedule-frame] is
  // mounted; a footer copy is rendered below instead.
  const scheduleBody =
    view === "agenda" ? (
      <AgendaView
        days={daysForEvent}
        locations={locationsForEvent}
        eventSlug={event.slug}
        timezone={event.timezone}
        toolbar={toolbar}
        scrollerRef={scrollerRef}
        defaultFoldedDayIds={defaultFoldedDayIds}
        isFolded={isFolded}
        onToggleFold={toggleDayFold}
        search={search}
        debouncedSearch={debouncedSearch}
        onSearchChange={setSearch}
      />
    ) : (
      <GridView
        days={daysForEvent}
        locations={locationsForEvent}
        guests={guests}
        timezone={event.timezone}
        toolbar={toolbar}
        scrollerRef={scrollerRef}
        defaultFoldedDayIds={defaultFoldedDayIds}
        isFolded={isFolded}
        onToggleFold={toggleDayFold}
        search={search}
        debouncedSearch={debouncedSearch}
        onSearchChange={setSearch}
      />
    );

  return (
    // The grid's 1-on-1 column and the modal it opens share one copy of the
    // viewer's meetings, so answering one there updates the other.
    <MeetingsProvider>
      <div
        data-schedule-frame
        className="fixed inset-x-0 top-16 bottom-0 flex flex-col bg-surface"
      >
        {scheduleBody}
        {/* Keyed on the view: each renders its own scroll surface, so the
            gesture's listeners have to move with it. */}
        <PullToRefresh key={view} scrollerRef={scrollerRef} />
      </div>
      {viewSession && (
        <SessionModal sessionId={viewSession} eventSlug={event.slug} />
      )}
      <MeetingModalFromUrl />
      {kiosk && <KioskController nowIsOnSchedule={nowIsOnSchedule} />}
    </MeetingsProvider>
  );
}
