// As in the attendee directory: one comma-separated `filter` search param, and
// every active filter narrows the list further.
export const SCHEDULE_FILTERS = [
  { value: "mine", label: "My sessions" },
  { value: "rsvpd", label: "RSVP'd" },
  { value: "hosting", label: "Hosting" },
] as const;

export type ScheduleFilter = (typeof SCHEDULE_FILTERS)[number]["value"];

const VALUES: readonly ScheduleFilter[] = SCHEDULE_FILTERS.map((f) => f.value);

export function parseScheduleFilters(
  param: string | null | undefined
): ScheduleFilter[] {
  const requested = new Set((param ?? "").split(","));
  return VALUES.filter((value) => requested.has(value));
}

export function serializeScheduleFilters(
  filters: readonly ScheduleFilter[]
): string | null {
  const canonical = VALUES.filter((value) => filters.includes(value));
  return canonical.length > 0 ? canonical.join(",") : null;
}

export function sessionPassesFilters(
  filters: readonly ScheduleFilter[],
  viewer: { rsvpd: boolean; hosting: boolean }
): boolean {
  return filters.every((filter) => {
    switch (filter) {
      case "mine":
        return viewer.rsvpd || viewer.hosting;
      case "rsvpd":
        return viewer.rsvpd;
      case "hosting":
        return viewer.hosting;
    }
  });
}
