import { useCallback, useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { EventListScreen } from "../features/events/event-list-screen";
import { InAppLinks } from "./in-app-links";
import type { AppServices } from "./services";
import { ShellFrame, ShellProviders } from "./shell";
import { useDirectoryShell } from "./use-directory-shell";
import { useRetrying } from "./use-retrying";

export function HomePage({ services }: { services: AppServices }) {
  return (
    <ShellProviders api={services.api}>
      <Home api={services.api} />
    </ShellProviders>
  );
}

function Home({ api }: { api: AppServices["api"] }) {
  const { history } = useRouter();
  const {
    events,
    loaded,
    failed,
    retry: retryEvents,
    frame,
  } = useDirectoryShell(api);
  const loadSite = useCallback(async () => {
    const { data } = await api.GET("/api/v1/site");
    return data;
  }, [api]);
  const {
    data: site,
    failed: siteFailed,
    retry: retrySite,
  } = useRetrying(loadSite);

  const only = events.length === 1 ? events[0].slug : undefined;
  useEffect(() => {
    if (only) history.replace(`/${only}`);
  }, [history, only]);

  return (
    <ShellFrame api={api} {...frame}>
      {(failed || siteFailed) && (
        <div>
          <p>The events could not be loaded.</p>
          <button
            type="button"
            className="underline"
            onClick={() => {
              retryEvents();
              retrySite();
            }}
          >
            Try again
          </button>
        </div>
      )}
      {loaded && events.length === 0 && <p>No events found.</p>}
      {site && events.length > 1 && (
        <InAppLinks
          owns={({ pathname }) => events.some((e) => pathname === `/${e.slug}`)}
        >
          <EventListScreen site={site} events={events} />
        </InAppLinks>
      )}
    </ShellFrame>
  );
}
