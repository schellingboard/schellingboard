import { useEffect, useState } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { NavItem } from "./nav-bar";

export type EventSummary = Snapshot["event"];

/** Every event, and the server's clock as it answered; both undefined until it has. */
export function useEventList(api: ApiClient): {
  events: EventSummary[];
  now: Date | undefined;
} {
  const [list, setList] = useState<{ events: EventSummary[]; now: Date }>();
  useEffect(() => {
    let stale = false;
    api
      .GET("/api/v1/events")
      .then(({ data }) => {
        if (!stale && data)
          setList({ events: data.events, now: new Date(data.now) });
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api]);
  return { events: list?.events ?? [], now: list?.now };
}

/** The events for the nav bar, linking to each event's page. */
export function useEvents(
  api: ApiClient,
  href: (slug: string) => string
): NavItem[] {
  return useEventList(api).events.map((e) => ({
    name: e.name,
    href: href(e.slug),
  }));
}
