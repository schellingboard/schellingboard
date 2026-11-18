import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createObservable } from "../queries/store";

const createUnread = () => createObservable<number | undefined>(undefined);
export type UnreadStore = ReturnType<typeof createUnread>;
const createRevision = () => createObservable(0);

const UnreadContext = createContext<{
  unread: UnreadStore;
  revision: ReturnType<typeof createRevision>;
} | null>(null);

/** The notification bell's count, which the notification list also moves. */
export function UnreadProvider({ children }: { children: ReactNode }) {
  const [value] = useState(() => ({
    unread: createUnread(),
    revision: createRevision(),
  }));
  return (
    <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>
  );
}

/** Undefined until the first answer; without a provider the count is the caller's own. */
export function useUnread(): [number | undefined, (count: number) => void] {
  const shared = useContext(UnreadContext)?.unread;
  const [own] = useState(createUnread);
  const store = shared ?? own;
  return [useSyncExternalStore(store.subscribe, store.get), store.set];
}

/**
 * Moves each time the server says the viewer's notifications changed after
 * the first count, so an open notification list knows to load again.
 */
export function useNotificationRevision(): [number, () => void] {
  const shared = useContext(UnreadContext)?.revision;
  const [own] = useState(createRevision);
  const store = shared ?? own;
  const bump = useCallback(() => store.set(store.get() + 1), [store]);
  return [useSyncExternalStore(store.subscribe, store.get), bump];
}
