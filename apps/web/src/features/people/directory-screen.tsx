import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ATTENDEE_SORTS,
  DEFAULT_ATTENDEE_SORT,
} from "@schellingboard/domain/attendee-search";
import { serializeAttendeeFilters } from "@schellingboard/domain/attendee-filters";
import type { DirectoryEntry, DirectoryState } from "../../queries/directory";
import { Avatar } from "../../ui/avatar";
import { SearchInput } from "../../ui/search-input";
import { SEARCH_DEBOUNCE_MS } from "../../ui/use-debounced";
import {
  cardsFrom,
  directoryView,
  everyoneIn,
  withParams,
  type DirectoryCard,
} from "./directory-model";
import type { PeopleLinks } from "./links";

export type DirectoryScreenProps = {
  entries: DirectoryEntry[];
  status: DirectoryState["status"];
  now: Date;
  /** Null when the visitor has not chosen a name. */
  viewerId: string | null;
  meetingsEnabled: boolean;
  /** A new one per visit: what makes the random sort a fresh draw. */
  randomSeed: string;
  links: PeopleLinks;
  params: URLSearchParams;
  onParams: (next: URLSearchParams, options?: { push?: boolean }) => void;
  /** Drawn over the list with the order the list is showing, so a profile can walk it. */
  profile?: (lists: {
    matches: DirectoryCard[];
    everyone: DirectoryCard[];
  }) => ReactNode;
};

const LINK = "font-semibold text-brand-fg hover:text-brand-fg-hover";

export function DirectoryScreen(props: DirectoryScreenProps) {
  const { entries, status, now, viewerId, links, params, onParams } = props;
  const [seed, setSeed] = useState(props.randomSeed);
  const cards = useMemo(() => cardsFrom(entries, now), [entries, now]);
  const listQuery = params.toString();
  const { query, available, filters, sort, rows } = useMemo(
    () =>
      directoryView({
        cards,
        params: new URLSearchParams(listQuery),
        meetingsEnabled: props.meetingsEnabled,
        seed,
      }),
    [cards, listQuery, props.meetingsEnabled, seed]
  );
  const everyone = useMemo(() => everyoneIn(cards), [cards]);
  const sortDisabled = query !== "";
  const onlyHasProfile =
    filters.length === 1 && filters[0] === "hasProfile" && query === "";

  return (
    <>
      <div className="max-w-4xl mx-auto flex flex-col gap-6 px-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Attendees</h1>
          {viewerId && (
            <a href={links.edit} className={`text-sm ${LINK}`}>
              Edit profile
            </a>
          )}
        </div>

        <div className="space-y-4 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBox query={query} params={params} onParams={onParams} />
            <div className="flex flex-wrap items-center gap-2">
              {available.map((f) => {
                const active = filters.includes(f.value);
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() =>
                      onParams(
                        withParams(params, {
                          filter: serializeAttendeeFilters(
                            active
                              ? filters.filter((v) => v !== f.value)
                              : [...filters, f.value]
                          ),
                        }),
                        { push: true }
                      )
                    }
                    className={`text-sm px-3 py-2 rounded-md transition-colors ${
                      active
                        ? "bg-info text-on-info hover:bg-info-hover"
                        : "bg-surface-muted text-fg-muted hover:bg-surface-hover"
                    }`}
                    aria-pressed={active}
                    aria-label={`Filter by ${f.label}${active ? " (active)" : ""}`}
                  >
                    {f.label}
                  </button>
                );
              })}
              <label
                className="flex items-center gap-2 text-sm text-fg-muted"
                // On the label: browsers suppress pointer events on a disabled
                // control, so a title there would never show.
                title={
                  sortDisabled
                    ? "Search results are sorted by relevance"
                    : undefined
                }
              >
                Sort by
                <select
                  value={sort}
                  disabled={sortDisabled}
                  onChange={(e) => {
                    // Coming back to Random draws a new order, as a reload does.
                    if (e.target.value === "random")
                      setSeed(Math.random().toString(36).slice(2));
                    onParams(
                      withParams(params, {
                        sort:
                          e.target.value === DEFAULT_ATTENDEE_SORT
                            ? null
                            : e.target.value,
                      }),
                      { push: true }
                    );
                  }}
                  className="pl-2 pr-9 py-1.5 text-sm rounded-md border border-line bg-surface-raised disabled:bg-surface-muted disabled:text-fg-subtle"
                >
                  {ATTENDEE_SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              {rows.length > 0 && (
                <span className="text-sm text-fg-subtle">
                  {rows.length} attendee{rows.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </div>

          {rows.length > 0 ? (
            <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
              {rows.map((row) => (
                <li key={row.id} className="py-3">
                  <AttendeeRow
                    card={row}
                    href={links.guest(row.id, listQuery)}
                  />
                </li>
              ))}
            </ul>
          ) : entries.length === 0 &&
            (status === "loading" || status === "idle") ? (
            <p role="status" className="text-sm text-fg-subtle">
              Loading attendees…
            </p>
          ) : status === "error" && entries.length === 0 ? (
            <p role="alert" className="text-sm text-fg-subtle">
              Could not load the attendees. Reload the page to try again.
            </p>
          ) : (
            <p className="text-sm text-fg-subtle">
              {onlyHasProfile ? (
                <>
                  Nobody has filled in a profile yet.
                  {viewerId && (
                    <>
                      {" "}
                      <a href={links.edit} className={LINK}>
                        Be the first!
                      </a>
                    </>
                  )}
                </>
              ) : (
                "No attendees match."
              )}
            </p>
          )}
        </div>
      </div>
      {props.profile?.({ matches: rows, everyone: everyone })}
    </>
  );
}

function SearchBox({
  query,
  params,
  onParams,
}: Pick<DirectoryScreenProps, "params" | "onParams"> & { query: string }) {
  const [draft, setDraft] = useState(query);
  const [sent, setSent] = useState(query);
  const [seenQuery, setSeenQuery] = useState(query);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The debounce timer fires after later renders; it must see the current
  // params, or a filter clicked meanwhile would be written back off.
  const latest = useRef({ params, onParams });
  useEffect(() => {
    latest.current = { params, onParams };
  });
  useEffect(() => () => clearTimeout(timer.current), []);

  // Only back/forward moves the query under the box; replacing the draft when
  // one of its own searches lands would eat whatever was typed meanwhile.
  if (query !== seenQuery) {
    setSeenQuery(query);
    if (query !== sent) {
      setDraft(query);
      setSent(query);
    }
  }

  const search = (value: string) => {
    clearTimeout(timer.current);
    const trimmed = value.trim();
    if (trimmed === sent) return;
    setSent(trimmed);
    // Starting a search is a step Back can undo; refining it replaces that
    // step, or Back would unwind the query a few letters at a time.
    latest.current.onParams(
      withParams(latest.current.params, { q: trimmed || null }),
      { push: !(sent !== "" && trimmed !== "") }
    );
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        search(draft);
      }}
    >
      <SearchInput
        name="q"
        value={draft}
        onChange={(event) => {
          const value = event.target.value;
          setDraft(value);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => search(value), SEARCH_DEBOUNCE_MS);
        }}
        onClear={() => {
          setDraft("");
          search("");
        }}
        placeholder="Search names, languages, interests…"
        aria-label="Search"
        inputClassName="px-3 py-1.5 text-sm rounded-md border border-line focus:border-line-strong focus:outline-none"
      />
    </form>
  );
}

function AttendeeRow({ card, href }: { card: DirectoryCard; href: string }) {
  const {
    name,
    avatarUrl,
    pronouns,
    basedIn,
    isHost,
    excerpt,
    profileUpdated,
  } = card;
  // Sorting by recency with no visible dates would be opaque. Narrow screens
  // have no room beside the name, so it rides along under it there.
  const updated = profileUpdated && (
    <span className="text-xs text-fg-subtle">updated {profileUpdated}</span>
  );
  return (
    <a
      href={href}
      className="flex items-start gap-4 hover:bg-surface-sunken rounded-md px-2 py-1"
    >
      <Avatar name={name} size="md" image={avatarUrl} />
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-medium text-fg flex flex-wrap items-center gap-x-2 gap-y-1">
          {name}
          {isHost && (
            <span className="w-fit rounded-full bg-brand-tint-hover text-brand-fg text-xs font-semibold px-3 py-1">
              Session host
            </span>
          )}
        </span>
        {(pronouns || basedIn || updated) && (
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {(pronouns || basedIn) && (
              <span className="text-sm text-fg-subtle line-clamp-1">
                {[pronouns, basedIn].filter(Boolean).join(" · ")}
              </span>
            )}
            <span className="sm:hidden">{updated}</span>
          </span>
        )}
        {excerpt && (
          <span className="text-sm text-fg-muted line-clamp-2">{excerpt}</span>
        )}
      </div>
      {updated && (
        <span className="hidden shrink-0 self-start sm:block">{updated}</span>
      )}
    </a>
  );
}
