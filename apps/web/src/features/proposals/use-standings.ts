import { useEffect, useSyncExternalStore } from "react";
import type { StandingsQuery } from "../../queries/proposal-standings";

/**
 * Loaded once per mount: other guests' votes never reach the feed (ADR 0016),
 * and refetching on the viewer's own vote would move the row they just voted
 * on under their cursor when sorted by fewest votes.
 */
export function useStandings(query: StandingsQuery) {
  useEffect(() => {
    void query.refresh();
  }, [query]);
  return useSyncExternalStore(query.subscribe, query.get);
}
