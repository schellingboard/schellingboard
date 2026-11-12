import { useState, useSyncExternalStore } from "react";
import { useRouter } from "@tanstack/react-router";
import { backgroundOf, entryIndexOf } from "./panel-history";

/**
 * Names the history entry the page behind any side panel was reached at. It
 * stays the same through a replace and while panels open and close over the
 * page, so a scroll position kept under it comes back with Back and a reload.
 */
export function useHistoryEntry() {
  const { history } = useRouter();
  const pathname = useSyncExternalStore(
    (listener) => history.subscribe(listener),
    () => backgroundOf(history.location).pathname
  );
  const indexNow = () => entryIndexOf(history.location);
  const [entry, setEntry] = useState({ pathname, index: indexNow() });
  if (entry.pathname !== pathname) setEntry({ pathname, index: indexNow() });
  return `${entry.index}:${entry.pathname}`;
}
