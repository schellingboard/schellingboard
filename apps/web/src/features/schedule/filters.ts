export const MINE_KINDS = [
  { value: "rsvpd", label: "RSVP'd", summary: "RSVP'd" },
  { value: "hosting", label: "Hosting", summary: "hosting" },
  { value: "bookmarked", label: "Bookmarked", summary: "bookmarked" },
] as const;

export type MineKind = (typeof MINE_KINDS)[number]["value"];

/** `mine` is null while the My schedule chip is off, else the kinds it shows. */
export type ScheduleFilterState = {
  mine: readonly MineKind[] | null;
  /** The Hidden chip, which excludes the other chips; absent means off. */
  hidden?: boolean;
  /** The Clashes chip, which combines with My schedule; absent means off. */
  clashes?: boolean;
};

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
  const clashes = tokens.includes("clashes");
  const state = (mine: readonly MineKind[] | null): ScheduleFilterState =>
    clashes ? { mine, clashes } : { mine };
  if (!tokens.includes("mine") && legacy.length === 0)
    return tokens.includes("hidden") && !clashes
      ? { mine: null, hidden: true }
      : state(null);
  const narrowed = inCanonicalOrder((mineParam ?? "").split(","));
  if (narrowed.length > 0) return state(narrowed);
  return state(legacy.length > 0 ? legacy : DEFAULT_KINDS);
}

export function serializeScheduleFilters(state: ScheduleFilterState): {
  filter: string | null;
  mine: string | null;
} {
  const tokens = [
    ...(state.mine ? ["mine"] : []),
    ...(state.clashes ? ["clashes"] : []),
    ...(state.hidden && !state.mine && !state.clashes ? ["hidden"] : []),
  ];
  const kinds = state.mine ? inCanonicalOrder(state.mine) : null;
  return {
    filter: tokens.length > 0 ? tokens.join(",") : null,
    mine: kinds && !sameKinds(kinds, DEFAULT_KINDS) ? kinds.join(",") : null,
  };
}

export function sessionPassesFilters(
  state: ScheduleFilterState,
  viewer: Record<MineKind, boolean>
): boolean {
  return !state.mine || state.mine.some((kind) => viewer[kind]);
}
