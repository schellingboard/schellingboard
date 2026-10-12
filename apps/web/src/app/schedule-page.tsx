import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { EventPhase, getCurrentPhase } from "@schellingboard/domain/phase";
import { eventContextFrom } from "../replica/selectors";
import { legacyScheduleLinks } from "../schedule/links";
import {
  ScheduleScreen,
  type ScheduleActions,
} from "../schedule/schedule-screen";
import { addRsvp, removeRsvp } from "../commands/rsvp";
import { Footer } from "./footer";
import { hardNavigate, hardReload } from "./hard-navigate";
import { useHealth } from "./health";
import type { AppServices } from "./services";
import { ShellFrame, ShellProviders } from "./shell";
import { SyncIndicator } from "./sync-indicator";
import { useEvents } from "./use-events";
import {
  useScheduleSession,
  type ScheduleSession,
} from "./use-schedule-session";
import { useServerNow } from "./use-server-now";
import { useUrlSearchParams } from "./use-url-search-params";
import { NamePicker } from "./user-menu";
import { useViewer } from "./viewer";
import type { ReplicaStore } from "../replica/store";
import type { CommandRunner } from "../commands/runner";

const Message = ({ children }: { children: ReactNode }) => (
  <div role="status" className="p-6 text-fg">
    {children}
  </div>
);

/** An event's schedule with everything around it: the shell, the viewer, the replica. */
export function SchedulePage({
  services,
  slug,
}: {
  services: AppServices;
  slug: string;
}) {
  return (
    <ShellProviders api={services.api}>
      <ScheduleHost services={services} slug={slug} />
    </ShellProviders>
  );
}

function ScheduleHost({
  services,
  slug,
}: {
  services: AppServices;
  slug: string;
}) {
  const { api } = services;
  const viewer = useViewer();
  const [, , search] = useUrlSearchParams();
  const events = useEvents(api, (eventSlug) => `/legacy/${eventSlug}`);
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
      guests={guests.map((g) => ({
        id: g.id,
        name: g.name,
        authProtected: g.authProtected,
      }))}
      currentPath={`/legacy/${slug}`}
      search={search}
      onClockChange={hardReload}
    >
      <Body api={services.api} slug={slug} session={session} />
    </ShellFrame>
  );
}

const NO_GUESTS: never[] = [];
const noSubscribe = () => () => {};

function Body({
  api,
  slug,
  session,
}: {
  api: AppServices["api"];
  slug: string;
  session: ScheduleSession;
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
        <p>The schedule could not be loaded.</p>
        <button type="button" onClick={session.retry} className="underline">
          Try again
        </button>
      </Message>
    );
  return (
    <Loaded
      api={api}
      slug={slug}
      store={session.store}
      runner={session.runner}
    />
  );
}

function Loaded({
  api,
  slug,
  store,
  runner,
}: {
  api: AppServices["api"];
  slug: string;
  store: ReplicaStore;
  runner: CommandRunner;
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
  const health = useHealth(api);
  const [params, replaceParams] = useUrlSearchParams();
  const links = useMemo(() => legacyScheduleLinks(slug), [slug]);
  const viewer = useViewer();
  const [picking, setPicking] = useState(false);
  const actions = useMemo<ScheduleActions>(
    () => ({
      pickName: () => setPicking(true),
      toggleRsvp: async (sessionId, withdraw) => {
        const outcome = await runner.run(withdraw ? removeRsvp : addRsvp, {
          sessionId,
        });
        return outcome.ok
          ? { ok: true }
          : { ok: false, message: refusalMessage(outcome.code) };
      },
    }),
    [runner]
  );
  const phase = getCurrentPhase(eventContextFrom(snapshot).event, now);

  useEffect(() => {
    if (phase === EventPhase.PROPOSAL || phase === EventPhase.VOTING)
      hardNavigate(`/legacy/${slug}/proposals`);
  }, [phase, slug]);

  if (gone)
    return (
      <Message>
        <p>This event has been deleted.</p>
        <a href="/legacy" className="underline">
          Back to the events
        </a>
      </Message>
    );
  if (phase !== EventPhase.SCHEDULING)
    return phase === EventPhase.INACTIVE ? (
      <Message>Event unavailable: {snapshot.event.name}</Message>
    ) : null;

  return (
    <>
      <NamePicker
        open={picking}
        onClose={() => setPicking(false)}
        guests={snapshot.guests}
        choose={viewer.choose}
      />
      <ScheduleScreen
        actions={actions}
        snapshot={snapshot}
        now={now}
        links={links}
        params={params}
        onParamsChange={replaceParams}
        sync={<SyncIndicator store={store} />}
        footer={<Footer version={health?.version} inline />}
        onReload={hardReload}
      />
    </>
  );
}

const REFUSALS: Record<string, string> = {
  "session.full": "This session is full",
  "rsvp.ownSession": "Hosts cannot RSVP to their own session",
  "event.notSchedulingPhase":
    "RSVPs can only be changed during the scheduling phase",
  "guest.notInEvent": "You are not part of this event",
};

const refusalMessage = (code: string) =>
  REFUSALS[code] ?? "Failed to update RSVP. Please try again.";
