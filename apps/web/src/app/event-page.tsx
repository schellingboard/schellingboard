import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useLocation } from "@tanstack/react-router";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { CommandRunner } from "../commands/runner";
import type { ReplicaStore } from "../replica/store";
import { hardReload } from "./hard-navigate";
import type { AppServices } from "./services";
import { ShellFrame, ShellProviders } from "./shell";
import { useEvents } from "./use-events";
import {
  useScheduleSession,
  type ScheduleSession,
} from "./use-schedule-session";
import { useServerNow } from "./use-server-now";
import { useUrlSearchParams } from "./use-url-search-params";
import { useViewer } from "./viewer";

/** What a screen of one event gets once its replica is open. */
export type EventView = {
  api: AppServices["api"];
  slug: string;
  store: ReplicaStore;
  runner: CommandRunner;
  snapshot: Snapshot;
  now: Date;
};

const EventViewContext = createContext<EventView | null>(null);

/** The open event's view, for a screen rendered inside `EventLayout`. */
export function useEventView(): EventView {
  const view = useContext(EventViewContext);
  if (!view) throw new Error("useEventView outside an event");
  return view;
}

/** Opens an event once for all its screens, so moving between them keeps the replica and runner. */
export function EventLayout({
  services,
  slug,
  children,
}: {
  services: AppServices;
  slug: string;
  children: ReactNode;
}) {
  return (
    <EventPage services={services} slug={slug}>
      {(view) => (
        <EventViewContext.Provider value={view}>
          {children}
        </EventViewContext.Provider>
      )}
    </EventPage>
  );
}

export const Message = ({ children }: { children: ReactNode }) => (
  <div role="status" className="p-6 text-fg">
    {children}
  </div>
);

/** An event's screen with everything around it: the shell, the viewer, the replica. */
export function EventPage({
  services,
  slug,
  children,
}: {
  services: AppServices;
  slug: string;
  children: (view: EventView) => ReactNode;
}) {
  return (
    <ShellProviders api={services.api}>
      <EventHost services={services} slug={slug}>
        {children}
      </EventHost>
    </ShellProviders>
  );
}

function EventHost({
  services,
  slug,
  children,
}: {
  services: AppServices;
  slug: string;
  children: (view: EventView) => ReactNode;
}) {
  const { api } = services;
  const viewer = useViewer();
  const { search } = useUrlSearchParams();
  const pathname = useLocation({ select: (l) => l.pathname });
  const events = useEvents(api, (eventSlug) => `/${eventSlug}`);
  const session = useScheduleSession({
    api,
    slug,
    viewer: viewer.guestId,
    persistence: services.persistence,
    createSource: services.createSource,
  });
  const store = session.status === "ready" ? session.store : undefined;
  const guests = useSyncExternalStore(
    (listener) => store?.subscribe(listener) ?? noSubscribe(),
    () => store?.get().guests ?? NO_GUESTS
  );

  return (
    <ShellFrame
      api={api}
      events={events}
      guests={
        store &&
        guests.map((g) => ({
          id: g.id,
          name: g.name,
          authProtected: g.authProtected,
        }))
      }
      currentPath={pathname}
      search={search}
      onClockChange={hardReload}
    >
      <Body api={api} slug={slug} session={session}>
        {children}
      </Body>
    </ShellFrame>
  );
}

const NO_GUESTS: never[] = [];
const noSubscribe = () => () => {};

function Body({
  api,
  slug,
  session,
  children,
}: {
  api: AppServices["api"];
  slug: string;
  session: ScheduleSession;
  children: (view: EventView) => ReactNode;
}) {
  if (session.status === "loading") return <Message>Loading…</Message>;
  if (session.status === "missing")
    return (
      <Message>
        <p>Event not found</p>
        <a href="/legacy" className="underline">
          Back to the events
        </a>
      </Message>
    );
  if (session.status === "failed")
    return (
      <Message>
        <p>The event could not be loaded.</p>
        <button type="button" onClick={session.retry} className="underline">
          Try again
        </button>
      </Message>
    );
  return (
    <Ready api={api} slug={slug} store={session.store} runner={session.runner}>
      {children}
    </Ready>
  );
}

function Ready({
  api,
  slug,
  store,
  runner,
  children,
}: {
  api: AppServices["api"];
  slug: string;
  store: ReplicaStore;
  runner: CommandRunner;
  children: (view: EventView) => ReactNode;
}) {
  const snapshot = useSyncExternalStore(
    (listener) => runner.subscribe(listener),
    () => runner.view()
  );
  const gone = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.gone()
  );
  const now = useServerNow(store);
  if (gone)
    return (
      <Message>
        <p>This event has been deleted.</p>
        <a href="/legacy" className="underline">
          Back to the events
        </a>
      </Message>
    );
  return <>{children({ api, slug, store, runner, snapshot, now })}</>;
}
