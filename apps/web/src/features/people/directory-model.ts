import {
  ATTENDEE_SORTS,
  DEFAULT_ATTENDEE_SORT,
  searchAttendees,
  type AttendeeSort,
} from "@schellingboard/domain/attendee-search";
import {
  availableAttendeeFilters,
  matchesAttendeeFilters,
  parseAttendeeFilters,
  type AttendeeFilter,
} from "@schellingboard/domain/attendee-filters";
import {
  hasFilledProfile,
  profileExcerpt,
} from "@schellingboard/domain/attendee-profile";
import { formatRelativeTime } from "@schellingboard/domain/relative-time";
import type { DirectoryEntry } from "../../queries/directory";
import { plainText } from "../../ui/plain-text";

/** An entry plus what the list derives from it once, up front. */
export type DirectoryCard = DirectoryEntry & {
  hasProfile: boolean;
  excerpt: string | null;
  profileUpdated: string | null;
};

export function cardsFrom(
  entries: DirectoryEntry[],
  now: Date
): DirectoryCard[] {
  return entries.map((entry) => ({
    ...entry,
    hasProfile: hasFilledProfile(entry),
    excerpt: profileExcerpt(entry, (markdown) => plainText(markdown ?? "")),
    profileUpdated: entry.profileUpdatedAt
      ? formatRelativeTime(entry.profileUpdatedAt, now)
      : null,
  }));
}

/** The search, filters and sort the address bar asks for, applied to the cards. */
export function directoryView({
  cards,
  params,
  meetingsEnabled,
  seed,
}: {
  cards: DirectoryCard[];
  params: URLSearchParams;
  meetingsEnabled: boolean;
  seed: string;
}) {
  const query = (params.get("q") ?? "").trim();
  const available = availableAttendeeFilters(meetingsEnabled);
  const filters = parseAttendeeFilters(params.get("filter") ?? "", available);
  const requested = params.get("sort");
  const sort: AttendeeSort =
    ATTENDEE_SORTS.find((s) => s.value === requested)?.value ??
    DEFAULT_ATTENDEE_SORT;
  const scoped = cards.filter((card) => matchesAttendeeFilters(card, filters));
  return {
    query,
    available,
    filters,
    sort,
    rows: searchAttendees(scoped, query, sort, seed),
  };
}

export type { AttendeeFilter };

/** `params` with each update applied; null or an empty value removes the key. */
export function withParams(
  params: URLSearchParams,
  updates: Record<string, string | null>
): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  return next;
}
