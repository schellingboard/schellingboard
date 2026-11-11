import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { EventStatistics } from "@schellingboard/contracts/stats";
import { Outlet, useLocation, useRouter } from "@tanstack/react-router";
import { useParamUpdates } from "./use-param-updates";
import { formatDayLabel } from "@schellingboard/domain/time";
import { adminEventCalls } from "../commands/admin-events";
import { adminGuestCalls } from "../commands/admin-guests";
import { adminLocationCalls } from "../commands/admin-locations";
import { adminSettingsCalls } from "../commands/admin-settings";
import { EventConfigTab } from "../features/admin/event-config";
import { EventGuestsManager } from "../features/admin/event-guests";
import { AdminEventLayout } from "../features/admin/event-layout";
import { EventLocationsManager } from "../features/admin/event-locations";
import { EventProposalsManager } from "../features/admin/event-proposals";
import { EventStatsScreen } from "../features/admin/event-stats";
import { EventSessionsManager } from "../features/admin/event-sessions";
import { AdminEventsScreen } from "../features/admin/events-screen";
import { UserImportScreen } from "../features/admin/guest-import";
import { AdminGuestsScreen } from "../features/admin/guests-screen";
import { LocationAvailabilityManager } from "../features/admin/location-availability";
import { LocationsScreen } from "../features/admin/locations-screen";
import { SettingsScreen } from "../features/admin/settings-screen";
import { defaultStatsEvent } from "../features/admin/stats-event";
import { createAdminEventQuery } from "../queries/admin-event";
import { createAdminEventsQuery } from "../queries/admin-events";
import { createAdminGuestsQuery } from "../queries/admin-guests";
import { createAdminLocationsQuery } from "../queries/admin-locations";
import { createAdminMeetingPointsQuery } from "../queries/admin-meeting-points";
import { createAdminProposalsQuery } from "../queries/admin-proposals";
import {
  createAdminSessionsQuery,
  loadSessionRsvpGuests,
  scheduledOf,
} from "../queries/admin-sessions";
import {
  createAdminStatsQuery,
  filterFromParams,
  type StatsFilter,
} from "../queries/admin-stats";
import { createAdminSettingsQuery } from "../queries/admin-settings";
import { createAdminUnavailabilityQuery } from "../queries/admin-unavailability";
import { AdminFrame, useReloadAdminGate } from "./admin-frame";
import { InAppLinks } from "./in-app-links";
import type { AppServices } from "./services";
import { useUrlSearchParams } from "./use-url-search-params";
import { jointStatus, useQuery } from "./use-query";

type Api = AppServices["api"];

const OWNED = /^\/admin(\/|$)/;

/** The admin pages, for a signed-in site admin. */
export function AdminSection({ services }: { services: AppServices }) {
  const pathname = useLocation({ select: (l) => l.pathname });
  const { search } = useUrlSearchParams();
  return (
    <InAppLinks owns={({ pathname: to }) => OWNED.test(to)}>
      <AdminFrame api={services.api} currentPath={pathname} search={search}>
        <Outlet />
      </AdminFrame>
    </InAppLinks>
  );
}

export function AdminHome() {
  return <Redirect to="/admin/events" />;
}

const named = ({ id, name }: { id: string; name: string }) => ({ id, name });

export function AdminEventsPage({ api }: { api: Api }) {
  const [state, load] = useQuery(() => createAdminEventsQuery({ api }));
  const calls = useMemo(() => adminEventCalls(api), [api]);
  const { params, onParams } = useParamUpdates();
  return (
    <AdminEventsScreen
      params={params}
      onParams={onParams}
      status={state.status}
      events={state.status === "ready" ? state.events : []}
      calls={calls}
      onCreated={load}
    />
  );
}

export function AdminUsersPage({ api }: { api: Api }) {
  const [guests, loadGuests] = useQuery(() => createAdminGuestsQuery({ api }));
  const [events] = useQuery(() => createAdminEventsQuery({ api }));
  const calls = useMemo(() => adminGuestCalls(api), [api]);
  const { params, onParams } = useParamUpdates();
  return (
    <AdminGuestsScreen
      status={jointStatus(guests, events)}
      guests={guests.status === "ready" ? guests.guests : []}
      events={events.status === "ready" ? events.events.map(named) : []}
      params={params}
      onParams={onParams}
      calls={calls}
      onChanged={loadGuests}
    />
  );
}

export function AdminUserImportPage({ api }: { api: Api }) {
  const [events] = useQuery(() => createAdminEventsQuery({ api }));
  const calls = useMemo(() => adminGuestCalls(api), [api]);
  if (events.status === "error")
    return (
      <p role="alert" className="text-sm text-danger-fg">
        Could not load the events.
      </p>
    );
  if (events.status === "loading") return <p className="text-sm">Loading…</p>;
  return <UserImportScreen events={events.events.map(named)} calls={calls} />;
}

export function AdminLocationsPage({ api }: { api: Api }) {
  const [locations, load] = useQuery(() => createAdminLocationsQuery({ api }));
  const [events] = useQuery(() => createAdminEventsQuery({ api }));
  const calls = useMemo(() => adminLocationCalls(api), [api]);
  const { params, onParams } = useParamUpdates();
  return (
    <LocationsScreen
      params={params}
      onParams={onParams}
      status={jointStatus(locations, events)}
      locations={locations.status === "ready" ? locations.locations : []}
      events={events.status === "ready" ? events.events.map(named) : []}
      calls={calls}
      onChanged={load}
    />
  );
}

const NO_SETTINGS = { title: "", description: "", mapImageUrl: "" };

export function AdminSettingsPage({ api }: { api: Api }) {
  const [state, load] = useQuery(() => createAdminSettingsQuery({ api }));
  const reloadGate = useReloadAdminGate();
  const calls = useMemo(() => adminSettingsCalls(api), [api]);
  return (
    <SettingsScreen
      status={state.status}
      settings={state.status === "ready" ? state.settings : NO_SETTINGS}
      calls={calls}
      onSaved={() => {
        load();
        reloadGate();
      }}
    />
  );
}

const TABS = ["guests", "locations", "proposals", "sessions", "stats"];

function Redirect({ to }: { to: string }) {
  const { history } = useRouter();
  useEffect(() => history.replace(to), [history, to]);
  return null;
}

export function AdminStatisticsHome({ api }: { api: Api }) {
  const [events] = useQuery(() => createAdminEventsQuery({ api }));
  if (events.status === "error") return <Failed>the events</Failed>;
  if (events.status === "loading") return <p className="text-sm">Loading…</p>;
  const event = defaultStatsEvent(events.events, new Date(events.now));
  if (!event)
    return <p className="text-sm text-fg-muted">There are no events yet.</p>;
  return <Redirect to={`/admin/statistics/${event.id}`} />;
}

export function AdminStatisticsPage({ api, id }: { api: Api; id: string }) {
  const [events] = useQuery(() => createAdminEventsQuery({ api }));
  const { history } = useRouter();
  const { params } = useUrlSearchParams();
  const section = params.get("section");
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold text-fg">Statistics</h1>
        {events.status === "ready" && (
          <label className="flex items-center gap-2 text-sm font-medium text-fg-muted">
            Event
            <select
              value={id}
              onChange={(e) =>
                history.push(
                  `/admin/statistics/${e.target.value}${section ? `?section=${encodeURIComponent(section)}` : ""}`
                )
              }
              className="rounded-md border border-line bg-surface-raised py-1.5 pl-3 pr-8 text-base text-fg sm:text-sm"
            >
              {events.events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <StatsTab key={id} api={api} id={id} />
    </div>
  );
}

export function AdminEventPage({ api, id }: { api: Api; id: string }) {
  const pathname = useLocation({ select: (l) => l.pathname });
  const [state, load] = useQuery(() => createAdminEventQuery({ api, id }));
  const tab = pathname.replace(/\/$/, "").split("/").slice(4)[0];
  const ready = state.status === "ready" ? state : undefined;

  return (
    <AdminEventLayout
      status={state.status}
      event={ready?.event}
      currentPath={pathname}
    >
      {ready &&
        (tab === undefined ? (
          <ConfigTab api={api} id={id} state={ready} reload={load} />
        ) : TABS.includes(tab) ? (
          <Tab api={api} id={id} tab={tab} state={ready} />
        ) : (
          <p role="alert" className="text-sm text-danger-fg">
            Page not found.
          </p>
        ))}
    </AdminEventLayout>
  );
}

type EventState = Extract<
  ReturnType<typeof createAdminEventQuery>["get"] extends () => infer S
    ? S
    : never,
  { status: "ready" }
>;

function ConfigTab({
  api,
  id,
  state,
  reload,
}: {
  api: Api;
  id: string;
  state: EventState;
  reload: () => void;
}) {
  const { history } = useRouter();
  const calls = useMemo(() => adminEventCalls(api), [api]);
  const [points, loadPoints] = useQuery(() =>
    createAdminMeetingPointsQuery({ api, id })
  );
  const [sessions, loadSessions] = useQuery(() =>
    createAdminSessionsQuery({ api, eventId: id })
  );
  if (jointStatus(points, sessions) === "error")
    return <Failed>the event settings</Failed>;
  if (points.status !== "ready" || sessions.status !== "ready")
    return <p className="text-sm">Loading…</p>;
  return (
    <EventConfigTab
      event={state.event}
      days={state.days}
      moments={state.moments}
      points={points.points}
      sessions={scheduledOf(sessions.sessions)}
      calls={calls}
      onChanged={() => {
        reload();
        loadSessions();
      }}
      onPointsChanged={loadPoints}
      onDeleted={() => history.push("/admin/events")}
    />
  );
}

function Failed({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-sm text-danger-fg">
      Could not load {children}.
    </p>
  );
}

function Tab({
  api,
  id,
  tab,
  state,
}: {
  api: Api;
  id: string;
  tab: string;
  state: EventState;
}) {
  switch (tab) {
    case "guests":
      return <GuestsTab api={api} id={id} />;
    case "locations":
      return <LocationsTab api={api} id={id} state={state} />;
    case "proposals":
      return <ProposalsTab api={api} id={id} />;
    case "stats":
      return <StatsRedirect id={id} />;
    default:
      return <SessionsTab api={api} id={id} state={state} />;
  }
}

function StatsRedirect({ id }: { id: string }) {
  const { search } = useUrlSearchParams();
  return <Redirect to={`/admin/statistics/${id}${search}`} />;
}

function GuestsTab({ api, id }: { api: Api; id: string }) {
  const [guests, load] = useQuery(() => createAdminGuestsQuery({ api }));
  const calls = useMemo(() => adminEventCalls(api), [api]);
  const { params, onParams } = useParamUpdates();
  if (guests.status === "error") return <Failed>the guests</Failed>;
  if (guests.status === "loading") return <p className="text-sm">Loading…</p>;
  return (
    <EventGuestsManager
      eventId={id}
      guests={guests.guests}
      params={params}
      onParams={onParams}
      calls={calls}
      onChanged={load}
    />
  );
}

function LocationsTab({
  api,
  id,
  state,
}: {
  api: Api;
  id: string;
  state: EventState;
}) {
  const [locations, load] = useQuery(() => createAdminLocationsQuery({ api }));
  const [periods, loadPeriods] = useQuery(() =>
    createAdminUnavailabilityQuery({ api, eventId: id })
  );
  const calls = useMemo(() => adminEventCalls(api), [api]);
  const { params, onParams } = useParamUpdates();
  if (jointStatus(locations, periods) === "error")
    return <Failed>the locations</Failed>;
  if (locations.status !== "ready" || periods.status !== "ready")
    return <p className="text-sm">Loading…</p>;
  return (
    <div className="space-y-8">
      <EventLocationsManager
        eventId={id}
        locations={locations.locations}
        params={params}
        onParams={onParams}
        calls={calls}
        onChanged={() => {
          load();
          loadPeriods();
        }}
      />
      <LocationAvailabilityManager
        eventId={id}
        periods={periods.periods}
        rooms={locations.locations
          .filter((l) => l.eventIds.includes(id))
          .map(named)}
        days={state.days}
        timezone={state.event.timezone}
        calls={calls}
        onChanged={loadPeriods}
      />
    </div>
  );
}

function StatsTab({ api, id }: { api: Api; id: string }) {
  const { params, onParams } = useParamUpdates();
  const filter = filterFromParams(params);
  const key = JSON.stringify(filter);
  const query = useMemo(
    () =>
      createAdminStatsQuery({
        api,
        eventId: id,
        filter: JSON.parse(key) as StatsFilter,
      }),
    [api, id, key]
  );
  useEffect(() => {
    void query.load();
  }, [query]);
  const state = useSyncExternalStore(query.subscribe, query.get);
  // Figures stay on screen while a changed filter loads, so the panel keeps its place.
  const [shown, setShown] = useState<EventStatistics>();
  if (state.status === "ready" && state.stats !== shown) setShown(state.stats);
  return (
    <EventStatsScreen
      eventId={id}
      status={state.status === "error" ? "error" : shown ? "ready" : "loading"}
      stats={shown}
      params={params}
      onParams={onParams}
    />
  );
}

function ProposalsTab({ api, id }: { api: Api; id: string }) {
  const [proposals, load] = useQuery(() =>
    createAdminProposalsQuery({ api, eventId: id })
  );
  const [guests] = useQuery(() => createAdminGuestsQuery({ api }));
  const calls = useMemo(() => adminEventCalls(api), [api]);
  const { params, onParams } = useParamUpdates();
  if (jointStatus(proposals, guests) === "error")
    return <Failed>the proposals</Failed>;
  if (proposals.status !== "ready" || guests.status !== "ready")
    return <p className="text-sm">Loading…</p>;
  return (
    <EventProposalsManager
      proposals={proposals.proposals}
      guests={guests.guests.filter((g) => g.eventIds.includes(id)).map(named)}
      params={params}
      onParams={onParams}
      calls={calls}
      onChanged={load}
    />
  );
}

function SessionsTab({
  api,
  id,
  state,
}: {
  api: Api;
  id: string;
  state: EventState;
}) {
  const [sessions, load] = useQuery(() =>
    createAdminSessionsQuery({ api, eventId: id })
  );
  const [guests] = useQuery(() => createAdminGuestsQuery({ api }));
  const [locations] = useQuery(() => createAdminLocationsQuery({ api }));
  const calls = useMemo(() => adminEventCalls(api), [api]);
  const { params, onParams } = useParamUpdates();
  const days = useMemo(
    () =>
      state.days.map((d) => ({
        key: d.id,
        label: formatDayLabel(
          {
            ...d,
            start: new Date(d.start),
            end: new Date(d.end),
            startBookings: new Date(d.startBookings),
            endBookings: new Date(d.endBookings),
          },
          state.event.timezone
        ),
        start: d.start,
        end: d.end,
      })),
    [state]
  );
  if (jointStatus(sessions, guests, locations) === "error")
    return <Failed>the sessions</Failed>;
  if (
    sessions.status !== "ready" ||
    guests.status !== "ready" ||
    locations.status !== "ready"
  )
    return <p className="text-sm">Loading…</p>;
  return (
    <EventSessionsManager
      eventId={id}
      sessions={sessions.sessions}
      guests={guests.guests.filter((g) => g.eventIds.includes(id)).map(named)}
      locations={locations.locations
        .filter((l) => l.eventIds.includes(id))
        .map(({ id: locationId, name, capacity }) => ({
          id: locationId,
          name,
          capacity,
        }))}
      guestNames={new Map(guests.guests.map((g) => [g.id, g.name]))}
      loadRsvps={(sessionId) => loadSessionRsvpGuests(api, sessionId)}
      timezone={state.event.timezone}
      days={days}
      breakMinutes={state.event.breakMinutes}
      params={params}
      onParams={onParams}
      calls={calls}
      onChanged={load}
    />
  );
}
