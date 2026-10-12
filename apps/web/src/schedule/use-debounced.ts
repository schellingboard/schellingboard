import { useEffect, useState } from "react";

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
