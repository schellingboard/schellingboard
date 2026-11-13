import {
  type AttendeeFilter,
  availableAttendeeFilters,
  matchesAttendeeFilters,
  parseAttendeeFilters,
} from "@schellingboard/domain/attendee-filters";
import {
  hasFilledProfile,
  profileExcerpt,
} from "@schellingboard/domain/attendee-profile";
import {
  ATTENDEE_SORTS,
  type AttendeeSort,
  DEFAULT_ATTENDEE_SORT,
  searchAttendees,
} from "@schellingboard/domain/attendee-search";
import { formatRelativeTime } from "@schellingboard/domain/relative-time";

import type { DirectoryEntry } from "../../queries/directory";
import { plainText } from "../../ui/plain-text";
import { contactLabel } from "./contact-labels";

/** An entry plus what the list derives from it once, up front. */
export type DirectoryCard = DirectoryEntry & {
  hasProfile: boolean;
  excerpt: string | null;
  profileUpdated: string | null;
};

export function cardsFrom(
  entries: DirectoryEntry[],
  now: Date,
  locale = "en"
): DirectoryCard[] {
  return entries.map((entry) => ({
    ...entry,
    hasProfile: hasFilledProfile(entry),
    excerpt: profileExcerpt(entry, (markdown) => plainText(markdown ?? "")),
    profileUpdated: entry.profileUpdatedAt
      ? formatRelativeTime(entry.profileUpdatedAt, now, locale)
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
  const groups = labelGroups(cards);
  const known = new Set(groups.flatMap((g) => g.labels.map((l) => l.id)));
  const labelIds = (params.get("labels") ?? "")
    .split(",")
    .filter((id) => known.has(id));
  const scoped = cards.filter(
    (card) =>
      matchesAttendeeFilters(card, filters) &&
      (labelIds.length === 0 ||
        card.labels.some((l) => labelIds.includes(l.id)))
  );
  return {
    query,
    available,
    filters,
    labelIds,
    labelGroups: groups,
    sort,
    rows: searchAttendees(scoped, query, sort, seed, contactLabel),
  };
}

export type LabelGroup = { eventName: string; labels: DirectoryCard["labels"] };

export function labelGroups(cards: DirectoryCard[]): LabelGroup[] {
  const byId = new Map(
    cards.flatMap((card) => card.labels).map((label) => [label.id, label])
  );
  const byEvent = new Map<string, LabelGroup>();
  for (const label of byId.values()) {
    const group = byEvent.get(label.eventId) ?? {
      eventName: label.eventName,
      labels: [],
    };
    group.labels.push(label);
    byEvent.set(label.eventId, group);
  }
  return [...byEvent.values()]
    .map((g) => ({
      ...g,
      labels: g.labels.sort(
        (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
      ),
    }))
    .sort((a, b) => a.eventName.localeCompare(b.eventName));
}

/** The canonical order, for a profile opened with no list behind it, or one the filters exclude. */
export function everyoneIn(cards: DirectoryCard[]): DirectoryCard[] {
  return searchAttendees(cards, "");
}

export type { AttendeeFilter };

/** `params` with each update applied; null or an empty value removes the key. */
export function withParams(
  params: URLSearchParams,
  updates: Record<string, string | null>
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (!("page" in updates)) next.delete("page");
  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  }
  return next;
}
