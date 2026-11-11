import { useCallback, useSyncExternalStore } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  closePanel,
  openPanel,
  panelOf,
  setPanelHash,
  type PanelItem,
} from "./panel-history";

/** The open side panel, read from the history entry, and ways to change it. */
export function usePanel() {
  const { history } = useRouter();
  const panel = useSyncExternalStore(
    (listener) => history.subscribe(listener),
    () => panelOf(history.location)
  );
  const open = useCallback(
    (item: PanelItem, how?: { fromPanel?: boolean; hash?: string }) =>
      openPanel(history, item, how),
    [history]
  );
  const close = useCallback(() => closePanel(history), [history]);
  const back = useCallback(() => history.back(), [history]);
  const setHash = useCallback(
    (hash: string) => setPanelHash(history, hash),
    [history]
  );
  return { panel, open, close, back, setHash };
}
