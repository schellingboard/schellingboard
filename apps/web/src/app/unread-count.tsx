import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createObservable } from "../queries/store";

const createUnread = () => createObservable<number | undefined>(undefined);
export type UnreadStore = ReturnType<typeof createUnread>;

const UnreadContext = createContext<UnreadStore | null>(null);

/** The notification bell's count, which the notification list also moves. */
export function UnreadProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createUnread);
  return (
    <UnreadContext.Provider value={store}>{children}</UnreadContext.Provider>
  );
}

/** Undefined until the first answer; without a provider the count is the caller's own. */
export function useUnread(): [number | undefined, (count: number) => void] {
  const shared = useContext(UnreadContext);
  const [own] = useState(createUnread);
  const store = shared ?? own;
  return [useSyncExternalStore(store.subscribe, store.get), store.set];
}
