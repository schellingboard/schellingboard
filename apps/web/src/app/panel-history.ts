import type { HistoryLocation, RouterHistory } from "@tanstack/react-router";

export type PanelItem =
  | { kind: "session"; slug: string; id: string; record?: boolean }
  | { kind: "proposal"; slug: string; id: string };

export type PanelState = {
  item: PanelItem;
  /** Entries in this stack, which Close travels back over. */
  depth: number;
  /** Reached by an address rather than a click: the page behind reveals it. */
  landed?: boolean;
};

type Background = { pathname: string; search: string; hash: string };

type Raw = {
  panel?: PanelState;
  __tempLocation?: Background & { href: string; state: object };
};

const rawState = (location: HistoryLocation) => location.state as Raw;

export const panelPath = (item: PanelItem) =>
  item.kind === "session"
    ? `/${item.slug}/sessions/${encodeURIComponent(item.id)}${item.record ? "?record=count" : ""}`
    : `/${item.slug}/proposals/${encodeURIComponent(item.id)}`;

export const panelOf = (location: HistoryLocation): PanelState | undefined =>
  rawState(location).panel;

/**
 * The page behind the panel. TanStack Router's `__tempLocation` is the real
 * location of a masked entry; it re-canonicalises the query string when asked
 * to build one, which breaks repeated keys, so the entries are written here.
 */
export function backgroundOf(location: HistoryLocation): Background {
  const temp = rawState(location).__tempLocation;
  if (!temp) {
    const { pathname, search, hash } = location;
    return { pathname, search, hash };
  }
  return { pathname: temp.pathname, search: temp.search, hash: temp.hash };
}

function pushEntry(
  history: RouterHistory,
  panel: PanelState,
  background: Background,
  hash: string
) {
  const state: Raw = {
    panel,
    __tempLocation: {
      ...background,
      href: `${background.pathname}${background.search}${background.hash}`,
      state: {},
    },
  };
  history.push(`${panelPath(panel.item)}${hash}`, state);
}

export function openPanel(
  history: RouterHistory,
  item: PanelItem,
  { fromPanel = false, hash = "" }: { fromPanel?: boolean; hash?: string } = {}
) {
  const current = panelOf(history.location);
  const background = backgroundOf(history.location);
  if (current && fromPanel) {
    pushEntry(history, { item, depth: current.depth + 1 }, background, hash);
  } else if (current) {
    const off = history.subscribe(() => {
      if (panelOf(history.location)) return;
      off();
      pushEntry(history, { item, depth: 1 }, background, hash);
    });
    history.go(-current.depth);
  } else {
    pushEntry(history, { item, depth: 1 }, background, hash);
  }
}

export function closePanel(history: RouterHistory) {
  const current = panelOf(history.location);
  if (current) history.go(-current.depth);
}

/** Puts the page behind the panel on `search`, keeping the panel and its entry. */
export function replaceBackground(history: RouterHistory, search: string) {
  const { location } = history;
  const state = rawState(location);
  const temp = state.__tempLocation;
  if (!temp) return;
  const next: Raw = {
    ...state,
    __tempLocation: {
      ...temp,
      search,
      href: `${temp.pathname}${search}${temp.hash}`,
    },
  };
  history.replace(
    `${location.pathname}${location.search}${location.hash}`,
    next
  );
}

export function setPanelHash(history: RouterHistory, hash: string) {
  const { location } = history;
  history.replace(
    `${location.pathname}${location.search}${hash}`,
    location.state
  );
}

/** An address that names a panel item: the page behind it takes the entry, the panel opens above. */
export function landOnPanel(
  history: RouterHistory,
  item: PanelItem,
  background: string,
  hash = ""
) {
  const [pathname, query = ""] = background.split("?");
  history.replace(background);
  pushEntry(
    history,
    { item, depth: 1, landed: true },
    { pathname, search: query ? `?${query}` : "", hash: "" },
    hash
  );
}
