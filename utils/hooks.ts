import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";

export const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const subscribeToNothing = () => () => {};

/**
 * The viewer's IANA timezone, or null on the server and during the first
 * hydration pass — the server can't know it, so rendering it directly would
 * not survive hydration. Pass it to `formatInLocalZone`, which falls back to
 * the event's zone until the swap happens.
 */
export function useLocalZone(): string | null {
  return useSyncExternalStore(
    subscribeToNothing,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => null
  );
}

export const useScreenWidth = () => {
  const [screenWidth, setScreenWidth] = useState(0);

  useSafeLayoutEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return screenWidth;
};

export const SEARCH_DEBOUNCE_MS = 200;

/**
 * `query`, trailing the keystrokes by `delayMs`, so a search whose results are
 * costly to render doesn't re-run on every character. Clearing applies at once.
 */
export function useDebouncedSearch(
  query: string,
  delayMs = SEARCH_DEBOUNCE_MS
): string {
  const [debounced, setDebounced] = useState(query);
  // Reset on render, not just in the return value: otherwise typing again
  // within delayMs of clearing would briefly bring back the old results.
  if (query.trim() === "" && debounced !== query) setDebounced(query);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), delayMs);
    return () => clearTimeout(timer);
  }, [query, delayMs]);
  return debounced;
}
