import { useEffect, useState } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import type { NavItem } from "./nav-bar";

/** The events for the nav bar, linking to each event's page. */
export function useEvents(
  api: ApiClient,
  href: (slug: string) => string
): NavItem[] {
  const [events, setEvents] = useState<{ name: string; slug: string }[]>([]);
  useEffect(() => {
    let stale = false;
    api
      .GET("/api/v1/events")
      .then(({ data }) => {
        if (!stale && data) setEvents(data.events);
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [api]);
  return events.map((e) => ({ name: e.name, href: href(e.slug) }));
}
