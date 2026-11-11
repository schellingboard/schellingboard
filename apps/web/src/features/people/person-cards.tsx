import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { DirectoryEntry, DirectoryQuery } from "../../queries/directory";

const PersonCardsContext = createContext<DirectoryQuery | null>(null);

export function PersonCardsProvider({
  query,
  children,
}: {
  query: DirectoryQuery;
  children: ReactNode;
}) {
  return (
    <PersonCardsContext.Provider value={query}>
      {children}
    </PersonCardsContext.Provider>
  );
}

const NEVER = { subscribe: () => () => {}, get: () => null };
const RETRY_AFTER_MS = 30_000;

// One index per loaded list, shared by every link on the page.
const indexes = new WeakMap<DirectoryEntry[], Map<string, DirectoryEntry>>();
function indexOf(entries: DirectoryEntry[]) {
  let index = indexes.get(entries);
  if (!index) {
    index = new Map(entries.map((e) => [e.id, e]));
    indexes.set(entries, index);
  }
  return index;
}
const lastTried = new WeakMap<DirectoryQuery, number>();

/** The guest's directory entry once loaded, and a way to start the load. */
export function usePersonEntry(guestId: string): {
  entry: DirectoryEntry | undefined;
  load: (() => void) | null;
} {
  const query = useContext(PersonCardsContext);
  const source = query ?? NEVER;
  const state = useSyncExternalStore(source.subscribe, source.get);
  if (!query || !state) return { entry: undefined, load: null };
  return {
    entry: indexOf(state.entries).get(guestId),
    load: () => {
      const retry =
        state.status === "error" &&
        Date.now() - (lastTried.get(query) ?? 0) > RETRY_AFTER_MS;
      if (state.status === "idle" || retry) {
        lastTried.set(query, Date.now());
        void query.refresh();
      }
    },
  };
}
