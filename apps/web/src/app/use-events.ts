import { useCallback } from "react";
import type { ApiClient } from "@schellingboard/api-client";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import type { NavItem } from "./nav-bar";
import { useRetrying } from "./use-retrying";

export type EventSummary = Snapshot["event"];

/** Every event, and the server's clock as it answered; both undefined until it has. */
export function useEventList(api: ApiClient): {
  events: EventSummary[];
  now: Date | undefined;
  loaded: boolean;
  failed: boolean;
  retry: () => void;
} {
  const load = useCallback(async () => {
    const { data } = await api.GET("/api/v1/events");
    return data && { events: data.events, now: new Date(data.now) };
  }, [api]);
  const { data: list, failed, retry } = useRetrying(load);
  return {
    events: list?.events ?? [],
    now: list?.now,
    loaded: !!list,
    failed,
    retry,
  };
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
