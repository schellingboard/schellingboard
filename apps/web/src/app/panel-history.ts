import type { HistoryLocation, RouterHistory } from "@tanstack/react-router";

export type PanelItem =
  | { kind: "session"; slug: string; id: string; record?: boolean }
  | { kind: "proposal"; slug: string; id: string }
  | { kind: "meeting"; slug: string; id: string }
  | { kind: "profile"; id: string };

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

const rawState = (location: Pick<HistoryLocation, "state">) =>
  location.state as Raw;

export const panelPath = (item: PanelItem) => {
  const id = encodeURIComponent(item.id);
  if (item.kind === "profile") return `/guests/${id}`;
  if (item.kind === "proposal") return `/${item.slug}/proposals/${id}`;
  if (item.kind === "meeting") return `/${item.slug}/meetings/${id}`;
  return `/${item.slug}/sessions/${id}${item.record ? "?record=count" : ""}`;
};

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

/** Back to the page, carrying over what was changed on it while the panel was open. */
export function closePanel(history: RouterHistory) {
  const current = panelOf(history.location);
  if (!current) return;
  const { search } = backgroundOf(history.location);
  const off = history.subscribe(() => {
    if (panelOf(history.location)) return;
    off();
    const { pathname, search: left, hash } = history.location;
    if (left !== search) history.replace(`${pathname}${search}${hash}`);
  });
  history.go(-current.depth);
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
  // A browser history merges a replace and a push of the same tick into one
  // push, which would leave the address being landed on under the panel.
  history.flush();
  pushEntry(
    history,
    { item, depth: 1, landed: true },
    { pathname, search: query ? `?${query}` : "", hash: "" },
    hash
  );
}

/**
 * The router's scroll hook, taking its scroll handling over: the window goes to
 * the top when the page behind changes (to its hash target, if any), and stays
 * put while only a panel or the page's own query changes. It always answers
 * "no", so the router's own per-entry restoration never runs.
 */
export function createScrollReset() {
  let shown: string | null = null;
  return ({
    location,
  }: {
    location: Pick<HistoryLocation, "pathname" | "hash" | "state">;
  }) => {
    const { pathname, hash } = rawState(location).__tempLocation ?? location;
    if (pathname === shown) return false;
    shown = pathname;
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
    return false;
  };
}

/** The position of the page behind any panel in the history stack. */
export function entryIndexOf(location: HistoryLocation) {
  const index = (location.state as { __TSR_index?: number }).__TSR_index ?? 0;
  return index - (panelOf(location)?.depth ?? 0);
}
