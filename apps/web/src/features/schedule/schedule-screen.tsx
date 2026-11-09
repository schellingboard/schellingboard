import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import {
  ScheduleMatchProvider,
  ScheduleProvider,
  type ScheduleActions,
} from "./context";

export type { ScheduleActions };
import { scheduleDataFrom } from "./data";
import { withClashes } from "./meetings";
import type { MeetingClashes } from "../../queries/meeting-clashes";
import { AgendaView } from "./agenda-view";
import {
  parseScheduleFilters,
  serializeScheduleFilters,
  ALL_KINDS,
  DEFAULT_KINDS,
  type MineKind,
  type ScheduleFilterState,
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
import { MeetingModals } from "./meeting-modals";
import { SessionModal } from "./session-modal";
import { ScheduleFilters } from "./schedule-filters";
import { ScheduleToolbar, scheduleView } from "./schedule-toolbar";
import { matchesInReadingOrder } from "./search";
import { PullToRefresh } from "./pull-to-refresh";
import { useDebouncedSearch } from "../../ui/use-debounced";
import { useDragToPan } from "./use-drag-to-pan";
import { dayOfSession, useRevealSession } from "./reveal-session";
import { useScrollRestoration } from "./use-scroll-restoration";
import { useStatusHeight } from "./use-status-height";

const NO_FILTERS: ScheduleFilterState = { mine: null };

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
  onBack,
  onHashChange,
  sync,
  footer,
  onReload,
  actions,
  clashes,
}: {
  snapshot: Snapshot;
  now: Date;
  links: ScheduleLinks;
  params: URLSearchParams;
  onParamsChange: (next: URLSearchParams, how?: { push: boolean }) => void;
  /** Undoes the history entry that opening a modal added. */
  onBack: () => void;
  /** Sets the address's hash in place, without a history entry. */
  onHashChange: (hash: string) => void;
  sync: ReactNode;
  footer: ReactNode;
  /** What a deliberate pull down from the top does. */
  onReload: () => void;
  actions: ScheduleActions;
  /** What else is on during the viewer's 1-on-1s, by meeting id. */
  clashes: MeetingClashes;
}) {
  const data = useMemo(() => {
    const base = scheduleDataFrom(snapshot, now);
    return { ...base, meetings: withClashes(base.meetings, clashes) };
  }, [snapshot, now, clashes]);
  const view = scheduleView(params);
  const scrollerRef = useRef<HTMLDivElement>(null);
  useDragToPan(scrollerRef, view === "grid");
  // Per view: the grid and the agenda have nothing in common to scroll to.
  useScrollRestoration(scrollerRef, `${snapshot.event.slug}:${view}`);
  const [addressed] = useState(() => params.get("viewSession"));
  // After restoration, so the address wins over the remembered position.
  useRevealSession(scrollerRef, addressed);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const [unfolded, setUnfolded] = useState<ReadonlySet<string>>(() => {
    const day = dayOfSession(data.days, addressed);
    return new Set(day ? [day] : []);
  });
  const toggleFold = (dayId: string) =>
    setUnfolded((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  const defaultFolded = getDefaultFoldedDayIds(data.days, now);

  const chosen = parseScheduleFilters(params.get("filter"), params.get("mine"));
  const filters = data.guestId ? chosen : NO_FILTERS;
  const [keptKinds, setKeptKinds] =
    useState<readonly MineKind[]>(DEFAULT_KINDS);
  const setFilters = (next: ScheduleFilterState) => {
    const updated = new URLSearchParams(params);
    const { filter, mine } = serializeScheduleFilters(next);
    if (filter) updated.set("filter", filter);
    else updated.delete("filter");
    if (mine) updated.set("mine", mine);
    else updated.delete("mine");
    onParamsChange(updated);
  };
  const mineKinds = filters.mine ?? keptKinds;

  const match = useMemo(
    () =>
      createScheduleMatch({
        search: debouncedSearch,
        filters,
        guestId: data.guestId,
        rsvpd: data.rsvpd,
        bookmarked: data.bookmarked,
        hidden: data.hidden,
        clashing: data.clashing,
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
  const viewSession = params.get("viewSession");
  // Opened here, Back closes it; reached by an address, there is no entry to pop.
  const openedHere = useRef(false);
  useEffect(() => {
    if (!viewSession) openedHere.current = false;
  }, [viewSession]);
  const openSession = (sessionId: string) => {
    const updated = new URLSearchParams(params);
    updated.set("viewSession", sessionId);
    openedHere.current = true;
    onParamsChange(updated, { push: true });
  };
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
  const matchKey = `${debouncedSearch}|${filters.mine?.join() ?? ""}|${filters.hidden ?? false}|${filters.clashes ?? false}`;
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
      mine={
        data.guestId
          ? {
              active: filters.mine !== null,
              kinds: mineKinds,
              hasBookmarks: data.hasBookmarks,
            }
          : null
      }
      hidden={
        data.guestId && (data.hasHidden || filters.hidden)
          ? { active: !!filters.hidden }
          : null
      }
      clashes={
        data.guestId && (data.hasClashes || filters.clashes)
          ? { active: !!filters.clashes }
          : null
      }
      onToggleClashes={() =>
        setFilters({ ...filters, hidden: false, clashes: !filters.clashes })
      }
      onToggleHidden={() => {
        if (filters.mine) setKeptKinds(filters.mine);
        setFilters({ mine: null, hidden: !filters.hidden });
      }}
      onToggleMine={() => {
        if (filters.mine) setKeptKinds(filters.mine);
        setFilters({
          ...filters,
          hidden: false,
          mine: filters.mine ? null : mineKinds,
        });
      }}
      onToggleKind={(kind) => {
        const next = mineKinds.includes(kind)
          ? mineKinds.filter((k) => k !== kind)
          : ALL_KINDS.filter((k) => k === kind || mineKinds.includes(k));
        if (next.length > 0)
          setFilters({ ...filters, hidden: false, mine: next });
      }}
      count={count}
      onShowAll={() => {
        setSearch("");
        setKeptKinds(DEFAULT_KINDS);
        setFilters(NO_FILTERS);
      }}
      onBackToTop={() =>
        scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      }
      onStep={view === "grid" ? step : undefined}
    />
  );

  return (
    <ScheduleProvider
      value={{
        data,
        links,
        params,
        actions,
        openSession,
        setHash: onHashChange,
      }}
    >
      {kiosk && <KioskController nowIsOnSchedule={nowIsOnSchedule} />}
      {viewSession && (
        <SessionModal
          sessionId={viewSession}
          onClose={() => {
            if (openedHere.current) return onBack();
            const updated = new URLSearchParams(params);
            updated.delete("viewSession");
            updated.delete("record");
            onParamsChange(updated);
          }}
        />
      )}
      <MeetingModals
        params={params}
        onParamsChange={onParamsChange}
        onBack={onBack}
        data={data}
        links={links}
        actions={actions}
      />
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
