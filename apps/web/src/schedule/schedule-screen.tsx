import { useMemo, useRef, useState, type ReactNode } from "react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import {
  ScheduleMatchProvider,
  ScheduleProvider,
  type ScheduleActions,
} from "./context";

export type { ScheduleActions };
import { scheduleDataFrom } from "./data";
import { AgendaView } from "./agenda-view";
import {
  parseScheduleFilters,
  SCHEDULE_FILTERS,
  serializeScheduleFilters,
  type ScheduleFilter,
} from "./filters";
import { getNowOffsetPx } from "./grid-layout";
import { getDefaultFoldedDayIds } from "./fold";
import { GridView } from "./grid-view";
import type { ScheduleLinks } from "./links";
import { KioskController, useKioskMode } from "./kiosk";
import { MatchStepper } from "./match-stepper";
import {
  countMatches,
  createScheduleMatch,
  includedLocations,
  scheduleEntries,
} from "./model";
import { ScheduleFilters } from "./schedule-filters";
import { ScheduleToolbar, scheduleView } from "./schedule-toolbar";
import { matchesInReadingOrder } from "./search";
import { PullToRefresh } from "./pull-to-refresh";
import { useDebouncedSearch } from "./use-debounced";
import { useDragToPan } from "./use-drag-to-pan";
import { useScrollRestoration } from "./use-scroll-restoration";
import { useStatusHeight } from "./use-status-height";

const NO_FILTERS: ScheduleFilter[] = [];

/**
 * The schedule of one event, drawn from its replica at `now`. The view, the
 * chosen filters and the narrowed rooms live in `params`, which the owner of
 * the address bar passes in and receives changes to; the search text is local.
 */
export function ScheduleScreen({
  snapshot,
  now,
  links,
  params,
  onParamsChange,
  sync,
  footer,
  onReload,
  actions,
}: {
  snapshot: Snapshot;
  now: Date;
  links: ScheduleLinks;
  params: URLSearchParams;
  onParamsChange: (next: URLSearchParams) => void;
  sync: ReactNode;
  footer: ReactNode;
  /** What a deliberate pull down from the top does. */
  onReload: () => void;
  actions: ScheduleActions;
}) {
  const data = useMemo(() => scheduleDataFrom(snapshot, now), [snapshot, now]);
  const view = scheduleView(params);
  const scrollerRef = useRef<HTMLDivElement>(null);
  useDragToPan(scrollerRef, view === "grid");
  // Per view: the grid and the agenda have nothing in common to scroll to.
  useScrollRestoration(scrollerRef, `${snapshot.event.slug}:${view}`);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const [unfolded, setUnfolded] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const toggleFold = (dayId: string) =>
    setUnfolded((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  const defaultFolded = getDefaultFoldedDayIds(data.days, now);

  const chosen = parseScheduleFilters(params.get("filter"));
  const filters = data.guestId ? chosen : NO_FILTERS;
  const setFilters = (next: ScheduleFilter[]) => {
    const updated = new URLSearchParams(params);
    const serialized = serializeScheduleFilters(next);
    if (serialized) updated.set("filter", serialized);
    else updated.delete("filter");
    onParamsChange(updated);
  };

  const match = useMemo(
    () =>
      createScheduleMatch({
        search: debouncedSearch,
        filters,
        guestId: data.guestId,
        rsvpd: data.rsvpd,
      }),
    [debouncedSearch, filters, data]
  );
  const locKey = params.getAll("loc").join("\u0000");
  const locParams = useMemo(
    () => (locKey ? locKey.split("\u0000") : []),
    [locKey]
  );
  const entries = useMemo(
    () =>
      scheduleEntries({
        days: data.days,
        locations: data.locations,
        locParams,
        meetings: data.meetings,
        match,
      }),
    [data, locParams, match]
  );
  const count = countMatches(entries, match);
  const { statusRef, statusHeight } = useStatusHeight();

  const kiosk = useKioskMode(params);
  const nowIsOnSchedule = data.days.some(
    (day) => getNowOffsetPx(day, now, data.event.slotIncrementMinutes) !== null
  );

  const [stepped, setStepped] = useState<{
    key: string;
    id: string;
    index: number;
    of: number;
  } | null>(null);
  // Changes whenever the set of matches may have, which ends any stepping.
  const matchKey = `${debouncedSearch}|${filters.join()}`;
  const current = stepped?.key === matchKey ? stepped : null;
  const step = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // Reading order, top to bottom and then left to right: the DOM runs
    // column by column instead.
    const found = matchesInReadingOrder(
      Array.from(scroller.querySelectorAll<HTMLElement>("[data-match-id]")).map(
        (element) => {
          const { top, left } = element.getBoundingClientRect();
          return { element, id: element.dataset.matchId!, top, left };
        }
      )
    );
    if (found.length === 0) return;
    const at = current ? found.findIndex((f) => f.id === current.id) : -1;
    const index =
      at === -1
        ? direction === 1
          ? 0
          : found.length - 1
        : (at + direction + found.length) % found.length;
    const { element, id } = found[index];
    element.scrollIntoView({
      block: "center",
      inline: "center",
      behavior: "smooth",
    });
    setStepped({ key: matchKey, id, index, of: found.length });
  };
  const stepMatch = useMemo(
    () => ({ ...match, currentMatchId: current?.id ?? null }),
    [match, current?.id]
  );

  const toolbar = (
    <ScheduleToolbar
      event={data.event}
      view={view}
      onViewChange={(next) => {
        const updated = new URLSearchParams(params);
        updated.set("view", next);
        onParamsChange(updated);
      }}
      showJumpToNow={nowIsOnSchedule}
      proposalsHref={links.proposals}
      sync={sync}
    />
  );
  const filterBar = (
    <ScheduleFilters
      statusRef={statusRef}
      layout={view === "grid" ? "grid" : "centered"}
      search={search}
      onSearchChange={setSearch}
      filters={
        data.guestId
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
        setSearch("");
        setFilters([]);
      }}
      onBackToTop={() =>
        scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      }
      onStep={view === "grid" ? step : undefined}
    />
  );

  return (
    <ScheduleProvider value={{ data, links, params, actions }}>
      {kiosk && <KioskController nowIsOnSchedule={nowIsOnSchedule} />}
      <ScheduleMatchProvider value={stepMatch}>
        {/* Both views own the viewport below the nav bar through the same
            fixed frame, so the toolbar rests in the same spot when switching.
            The scroller inside it is the only scroll surface; the toolbar is
            its first item. */}
        <div
          data-schedule-frame
          className="fixed inset-x-0 bottom-0 top-16 flex flex-col bg-surface"
        >
          {view === "agenda" ? (
            <AgendaView
              entries={entries}
              locations={data.locations}
              timezone={data.event.timezone}
              toolbar={toolbar}
              filterBar={filterBar}
              footer={footer}
              scrollerRef={scrollerRef}
              defaultFolded={defaultFolded}
              unfolded={unfolded}
              onToggleFold={toggleFold}
              filtering={match.filtering}
              statusHeight={statusHeight}
            />
          ) : (
            <GridView
              entries={entries}
              locations={includedLocations(data.locations, locParams)}
              timezone={data.event.timezone}
              toolbar={toolbar}
              filterBar={filterBar}
              footer={footer}
              stepper={
                <MatchStepper
                  index={current?.index ?? null}
                  of={current?.of ?? count?.matching ?? 0}
                  onStep={step}
                />
              }
              scrollerRef={scrollerRef}
              defaultFolded={defaultFolded}
              unfolded={unfolded}
              onToggleFold={toggleFold}
              filtering={match.filtering}
              statusHeight={statusHeight}
              matching={count?.matching ?? 0}
            />
          )}
          {/* Keyed on the view: each renders its own scroll surface, so the
              gesture's listeners have to move with it. */}
          <PullToRefresh
            key={view}
            scrollerRef={scrollerRef}
            onReload={onReload}
          />
        </div>
      </ScheduleMatchProvider>
    </ScheduleProvider>
  );
}
