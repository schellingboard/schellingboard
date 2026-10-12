import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * The address bar's query as URLSearchParams, and a way to replace it without
 * adding a history entry. The router's history is the source, so a back button
 * or an outside change re-renders.
 */
export function useUrlSearchParams() {
  const { history } = useRouter();
  const search = useSyncExternalStore(
    (listener) => history.subscribe(listener),
    () => history.location.search
  );
  const replace = useCallback(
    (next: URLSearchParams) => {
      const { pathname, hash } = history.location;
      const query = next.toString();
      history.replace(`${pathname}${query ? `?${query}` : ""}${hash}`);
    },
    [history]
  );
  return [new URLSearchParams(search), replace, search] as const;
}
