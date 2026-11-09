export const MINE_KINDS = [
  { value: "rsvpd", label: "RSVP'd", summary: "RSVP'd" },
  { value: "hosting", label: "Hosting", summary: "hosting" },
  { value: "bookmarked", label: "Bookmarked", summary: "bookmarked" },
] as const;

export type MineKind = (typeof MINE_KINDS)[number]["value"];

/** `mine` is null while the My schedule chip is off, else the kinds it shows. */
export type ScheduleFilterState = { mine: readonly MineKind[] | null };

export const ALL_KINDS: readonly MineKind[] = MINE_KINDS.map((k) => k.value);

export const DEFAULT_KINDS: readonly MineKind[] = ["rsvpd", "hosting"];

function sameKinds(a: readonly MineKind[], b: readonly MineKind[]) {
  return a.length === b.length && a.every((kind) => b.includes(kind));
}

function inCanonicalOrder(kinds: Iterable<string>): MineKind[] {
  const requested = new Set(kinds);
  return ALL_KINDS.filter((kind) => requested.has(kind));
}

// Older links used `filter=rsvpd` and `filter=hosting` as chips of their own.
export function parseScheduleFilters(
  filterParam: string | null | undefined,
  mineParam: string | null | undefined
): ScheduleFilterState {
  const tokens = (filterParam ?? "").split(",");
  const legacy = inCanonicalOrder(tokens);
  if (!tokens.includes("mine") && legacy.length === 0) return { mine: null };
  const narrowed = inCanonicalOrder((mineParam ?? "").split(","));
  if (narrowed.length > 0) return { mine: narrowed };
  return { mine: legacy.length > 0 ? legacy : DEFAULT_KINDS };
}

export function serializeScheduleFilters(state: ScheduleFilterState): {
  filter: string | null;
  mine: string | null;
} {
  if (!state.mine) return { filter: null, mine: null };
  const kinds = inCanonicalOrder(state.mine);
  return {
    filter: "mine",
    mine: sameKinds(kinds, DEFAULT_KINDS) ? null : kinds.join(","),
  };
}

export function sessionPassesFilters(
  state: ScheduleFilterState,
  viewer: Record<MineKind, boolean>
): boolean {
  return !state.mine || state.mine.some((kind) => viewer[kind]);
}
