import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useLocation } from "@tanstack/react-router";
import { createDirectoryQuery } from "../queries/directory";
import { hardReload } from "./hard-navigate";
import type { AppServices } from "./services";
import type { ShellProps } from "./shell";
import { useEventList } from "./use-events";
import { useUrlSearchParams } from "./use-url-search-params";

/**
 * What a screen outside an event needs around it: the events for the nav, the
 * attendees for the name picker, and the server's clock. `frame` is the rest
 * of the `ShellFrame`'s props.
 */
export function useDirectoryShell(api: AppServices["api"]) {
  const { events, now: serverNow, loaded, failed } = useEventList(api);
  const [loadedAt] = useState(() => new Date());
  const { search } = useUrlSearchParams();
  const pathname = useLocation({ select: (l) => l.pathname });
  const directory = useMemo(() => createDirectoryQuery({ api }), [api]);
  useEffect(() => {
    void directory.refresh();
  }, [directory]);
  const { status, entries } = useSyncExternalStore(
    directory.subscribe,
    directory.get
  );
  const frame: Omit<ShellProps, "api" | "children"> = {
    events: events.map((e) => ({ name: e.name, href: `/${e.slug}` })),
    guests:
      status === "ready" || entries.length > 0
        ? entries.map((e) => ({
            id: e.id,
            name: e.name,
            authProtected: e.authProtected,
          }))
        : undefined,
    currentPath: pathname,
    search,
    onClockChange: hardReload,
  };
  return {
    events,
    loaded,
    failed,
    now: serverNow ?? loadedAt,
    directory,
    status,
    entries,
    pathname,
    frame,
  };
}
