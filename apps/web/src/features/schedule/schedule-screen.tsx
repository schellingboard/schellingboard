import { useMemo, useRef, useState, type ReactNode } from "react";
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
import { BookingDialog } from "./booking-dialog";
import { ScheduleFilters } from "./schedule-filters";
import { ScheduleToolbar, scheduleView } from "./schedule-toolbar";
import { matchesInReadingOrder } from "./search";
import { PullToRefresh } from "./pull-to-refresh";
import { useScrollRestoration } from "../../ui/use-scroll-restoration";
import { useSearchParamText } from "../../ui/use-search-param-text";
import { useDragToPan } from "./use-drag-to-pan";
import { useTimeFormat } from "../../app/time-format";
import { dayOfSession, useRevealSession } from "./reveal-session";
import { useStatusHeight } from "./use-status-height";

const NO_FILTERS: ScheduleFilterState = { mine: null };

/**
 * The schedule of one event, drawn from its replica at `now`. The view, the
 * chosen filters and the narrowed rooms live in `params`, which the owner of
 * the address bar passes in and receives changes to; the debounced search text is kept in `q`.
 */
export function ScheduleScreen({
  snapshot,
  now,
  links,
  params,
  onParamsChange,
  onBack,
  openSession,
  revealSessionId,
  historyEntry,
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
  /** Opens a session's side panel over the schedule. */
  openSession: (sessionId: string) => void;
  /** A session an address named, or one just added, which is brought into view. */
  revealSessionId: string | null;
  /** Names the history entry the page is shown at, which its scroll position is kept under. */
  historyEntry: string;
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
  const timeFormat = useTimeFormat();
  const data = useMemo(() => {
    const base = scheduleDataFrom(snapshot, now, timeFormat);
    return { ...base, meetings: withClashes(base.meetings, clashes) };
  }, [snapshot, now, clashes, timeFormat]);
  const view = scheduleView(params);
  const scrollerRef = useRef<HTMLDivElement>(null);
  useDragToPan(scrollerRef, view === "grid");
  // Per view: the grid and the agenda have nothing in common to scroll to.
  useScrollRestoration(
    scrollerRef,
    `${historyEntry}:${view}`,
    true,
    `${snapshot.event.slug}:${view}`
  );

  const [search, setSearch, debouncedSearch] = useSearchParamText(
    params,
    onParamsChange
  );

  const [revealedDays, setRevealedDays] = useState<readonly string[]>([]);
  const [revealSeeded, setRevealSeeded] = useState<string | null>(null);
  const revealedDay = dayOfSession(data.days, revealSessionId);
  if (revealedDay && revealSeeded !== revealSessionId) {
    setRevealSeeded(revealSessionId);
    setRevealedDays((prev) => [...prev, revealedDay]);
  }
  // After restoration, so the revealed session wins over the remembered position.
  useRevealSession(scrollerRef, revealSessionId, revealedDay);
  const unfoldKey = params.getAll("unfold").join("\u0000");
  const unfolded: ReadonlySet<string> = useMemo(
    () =>
      new Set([
        ...(unfoldKey ? unfoldKey.split("\u0000") : []),
        ...revealedDays,
      ]),
    [unfoldKey, revealedDays]
  );
  const toggleFold = (dayId: string) => {
    const kept = new Set(params.getAll("unfold"));
    if (unfolded.has(dayId)) kept.delete(dayId);
    else kept.add(dayId);
    setRevealedDays((prev) => prev.filter((d) => d !== dayId));
    const updated = new URLSearchParams(params);
    updated.delete("unfold");
    for (const id of kept) updated.append("unfold", id);
    onParamsChange(updated);
  };
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
      now={data.now}
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
      <BookingDialog
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
