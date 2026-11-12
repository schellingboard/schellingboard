import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { EventListScreen } from "../features/events/event-list-screen";
import { InAppLinks } from "./in-app-links";
import type { AppServices } from "./services";
import { ShellFrame } from "./shell";
import { useParamUpdates } from "./use-param-updates";
import { useDirectoryShell } from "./use-directory-shell";
import { t } from "@lingui/core/macro";

export function HomePage({ services }: { services: AppServices }) {
  return <Home api={services.api} />;
}

function Home({ api }: { api: AppServices["api"] }) {
  const { history } = useRouter();
  const { params, onParams } = useParamUpdates();
  const { events, loaded, failed, frame } = useDirectoryShell(api);
  const [site, setSite] = useState<{ title: string; description: string }>();
  const [siteFailed, setSiteFailed] = useState(false);
  useEffect(() => {
    let stale = false;
    api
      .GET("/api/v1/site")
      .then(({ data }) => {
        if (stale) return;
        if (data) setSite(data);
        else setSiteFailed(true);
      })
      .catch(() => setSiteFailed(true));
    return () => {
      stale = true;
    };
  }, [api]);

  const only = events.length === 1 ? events[0].slug : undefined;
  useEffect(() => {
    if (only) history.replace(`/${only}`);
  }, [history, only]);

  return (
    <ShellFrame api={api} {...frame}>
      {(failed || siteFailed) && <p>{t`The events could not be loaded.`}</p>}
      {loaded && events.length === 0 && <p>{t`No events found.`}</p>}
      {site && events.length > 1 && (
        <InAppLinks
          owns={({ pathname }) => events.some((e) => pathname === `/${e.slug}`)}
        >
          <EventListScreen
            site={site}
            events={events}
            params={params}
            onParams={onParams}
          />
        </InAppLinks>
      )}
    </ShellFrame>
  );
}
