import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createObservable } from "../queries/store";
import { connectNotificationStream } from "./notification-stream";

const createUnread = () => createObservable<number | undefined>(undefined);
export type UnreadStore = ReturnType<typeof createUnread>;
const createRevision = () => createObservable(0);

const UnreadContext = createContext<{
  unread: UnreadStore;
  revision: ReturnType<typeof createRevision>;
} | null>(null);

/**
 * The notification bell's count, which the server pushes for `guestId` and
 * the notification list also moves.
 */
export function UnreadProvider({
  guestId,
  createSource,
  children,
}: {
  guestId: string | null | undefined;
  createSource: (url: string) => EventSource;
  children: ReactNode;
}) {
  const [value] = useState(() => ({
    unread: createUnread(),
    revision: createRevision(),
  }));
  useEffect(() => {
    if (!guestId) return;
    const stream = connectNotificationStream({
      createSource,
      onUnread: (count, initial) => {
        value.unread.set(count);
        if (!initial) value.revision.set(value.revision.get() + 1);
      },
    });
    return () => {
      stream.stop();
      value.unread.set(undefined);
    };
  }, [guestId, createSource, value]);
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
export function useNotificationRevision(): number {
  const shared = useContext(UnreadContext)?.revision;
  const [own] = useState(createRevision);
  const store = shared ?? own;
  return useSyncExternalStore(store.subscribe, store.get);
}
