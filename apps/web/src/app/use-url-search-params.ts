import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "@tanstack/react-router";

/**
 * The address bar's query as URLSearchParams, and a way to change it: replacing
 * by default, or adding a history entry so Back undoes the change. The router's
 * history is the source, so a back button or an outside change re-renders.
 */
export function useUrlSearchParams() {
  const { history } = useRouter();
  const search = useSyncExternalStore(
    (listener) => history.subscribe(listener),
    () => history.location.search
  );
  const change = useCallback(
    (next: URLSearchParams, { push = false } = {}) => {
      const { pathname, hash } = history.location;
      const query = next.toString();
      const path = `${pathname}${query ? `?${query}` : ""}`;
      // A pushed address is a new place: the old one's #comment- target is not its own.
      if (push) history.push(path);
      else history.replace(`${path}${hash}`);
    },
    [history]
  );
  const back = useCallback(() => history.back(), [history]);
  const setHash = useCallback(
    (hash: string) => {
      const { pathname, search: current } = history.location;
      history.replace(`${pathname}${current}${hash}`);
    },
    [history]
  );
  return {
    params: new URLSearchParams(search),
    change,
    search,
    back,
    setHash,
  };
}
