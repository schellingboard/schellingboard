import { CONTACT_TYPE_LABELS, type ContactType, type Guest } from "./guest";
import { containsIgnoringAccents, equalsIgnoringAccents } from "./search-text";

/** The fields a directory search reads. */
export type Searchable = Pick<
  Guest,
  | "id"
  | "name"
  | "aboutMe"
  | "pronouns"
  | "basedIn"
  | "languages"
  | "prompts"
  | "contacts"
  | "profileUpdatedAt"
>;

// Rank tiers, higher wins. Exact declared-language matches must beat
// incidental free-text mentions ("Italian" the speaker vs. "Italian food"
// in a bio); a name match beats both.
const NAME = 3;
const STRUCTURED = 2;
const FREE_TEXT = 1;

function rank(
  attendee: Searchable,
  query: string,
  contactLabel: (type: ContactType) => string
): number {
  if (containsIgnoringAccents(attendee.name, query)) return NAME;

  const languages = attendee.languages ?? [];
  if (languages.some((l) => equalsIgnoringAccents(l, query))) return STRUCTURED;

  // Every public profile field, including contacts — someone who knows a
  // handle should find its owner. The private system email is not part of
  // Attendee and so can never be matched here.
  const freeText = [
    attendee.basedIn,
    attendee.pronouns,
    attendee.aboutMe,
    ...languages,
    ...(attendee.prompts ?? []).flatMap((p) => [p.prompt, p.answer]),
    ...(attendee.contacts ?? []).flatMap((c) => [
      // Stored only for "other" contacts; the rest print the type's name.
      (c.type === "other" && c.label) || contactLabel(c.type),
      CONTACT_TYPE_LABELS[c.type],
      c.value,
    ]),
  ];
  if (freeText.some((t) => t && containsIgnoringAccents(t, query)))
    return FREE_TEXT;

  return 0;
}

export const ATTENDEE_SORTS = [
  { value: "name" },
  { value: "updated" },
  { value: "random" },
] as const;

export type AttendeeSort = (typeof ATTENDEE_SORTS)[number]["value"];

export const DEFAULT_ATTENDEE_SORT: AttendeeSort = "name";

// Not a secret, despite CodeQL's js/insecure-randomness alert: it only orders a
// list every viewer already sees in full, so predicting it gains nothing.
export function newSortSeed(): string {
  return Math.random().toString(36).slice(2);
}

// FNV-1a. Any well-mixed hash would do: the order only has to look arbitrary
// and come out identical on the server and in the browser.
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

/**
 * In-memory search over the full attendee list. Case-insensitive substring
 * matching, ranked by tier (name > declared language > free text), ties by
 * name. An empty query returns everyone in `sort` order. Pagination is the
 * caller's job (slice the result).
 *
 * A query overrides `sort`: relevance ranking is the more useful answer to a
 * search, and an explicit sort would discard it.
 *
 * `contactLabel` is the viewer-language name of a contact type; the English
 * name matches too.
 *
 * `seed` drives the random sort. A per-attendee key rather than a shuffle, so
 * that filtering the list down never reorders what is left of it.
 */
export function searchAttendees<A extends Searchable>(
  attendees: A[],
  query: string,
  sort: AttendeeSort = DEFAULT_ATTENDEE_SORT,
  seed = "",
  contactLabel: (type: ContactType) => string = (type) =>
    CONTACT_TYPE_LABELS[type]
): A[] {
  const byName = (a: A, b: A) =>
    a.name.localeCompare(b.name) || a.id.localeCompare(b.id);

  // Profiles never updated have no place on a recency axis, so they keep the
  // default ordering at the end of the list rather than at an arbitrary date.
  const byRecency = (a: A, b: A) => {
    const at = a.profileUpdatedAt?.getTime() ?? null;
    const bt = b.profileUpdatedAt?.getTime() ?? null;
    if (at === bt) return byName(a, b);
    if (at === null) return 1;
    if (bt === null) return -1;
    return bt - at;
  };

  const q = query.trim();
  if (!q && sort === "random") {
    return attendees
      .map((attendee) => ({ attendee, key: hash(`${seed}:${attendee.id}`) }))
      .sort((x, y) => x.key - y.key || byName(x.attendee, y.attendee))
      .map((r) => r.attendee);
  }
  if (!q) return [...attendees].sort(sort === "updated" ? byRecency : byName);

  return attendees
    .map((attendee) => ({ attendee, rank: rank(attendee, q, contactLabel) }))
    .filter((r) => r.rank > 0)
    .sort((x, y) => y.rank - x.rank || byName(x.attendee, y.attendee))
    .map((r) => r.attendee);
}
