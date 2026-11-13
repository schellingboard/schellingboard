import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, plural, t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { AttendeeFilter } from "@schellingboard/domain/attendee-filters";
import { serializeAttendeeFilters } from "@schellingboard/domain/attendee-filters";
import {
  ATTENDEE_SORTS,
  type AttendeeSort,
  DEFAULT_ATTENDEE_SORT,
} from "@schellingboard/domain/attendee-search";
import { useEffect, useMemo, useRef, useState } from "react";

import { useFormatLocale } from "../../i18n/format-locale";
import type { DirectoryEntry, DirectoryState } from "../../queries/directory";
import { Avatar } from "../../ui/avatar";
import { paramsUpdater } from "../../ui/list-paging";
import { ListToolbar } from "../../ui/list-toolbar";
import { SearchInput } from "../../ui/search-input";
import { Tooltip } from "../../ui/tooltip";
import { SEARCH_DEBOUNCE_MS } from "../../ui/use-debounced";
import { usePaging } from "../../ui/use-paging";
import { AttendeeLabels } from "./attendee-labels";
import {
  cardsFrom,
  type DirectoryCard,
  directoryView,
  withParams,
} from "./directory-model";
import { LabelMenu } from "./label-menu";
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
  /** Told the order the list is showing (null once it goes), so a profile panel can walk it. */
  onRows?: (rows: DirectoryCard[] | null) => void;
};

const LINK = "font-semibold text-brand-fg hover:text-brand-fg-hover";

const FILTER_LABEL: Record<
  AttendeeFilter,
  {
    chip: MessageDescriptor;
    aria: MessageDescriptor;
    ariaActive: MessageDescriptor;
  }
> = {
  isHost: {
    chip: msg`Session host`,
    aria: msg`Filter by Session host`,
    ariaActive: msg`Filter by Session host (active)`,
  },
  hasProfile: {
    chip: msg`Has profile`,
    aria: msg`Filter by Has profile`,
    ariaActive: msg`Filter by Has profile (active)`,
  },
  openToMeetings: {
    chip: msg`Open to 1-on-1s`,
    aria: msg`Filter by Open to 1-on-1s`,
    ariaActive: msg`Filter by Open to 1-on-1s (active)`,
  },
};

const SORT_LABEL: Record<AttendeeSort, MessageDescriptor> = {
  name: msg`Name (A–Z)`,
  updated: msg`Recently updated`,
  random: msg({
    message: "Random",
    comment: "Attendee sort order: a shuffled list",
  }),
};

export function DirectoryScreen(props: DirectoryScreenProps) {
  const { entries, status, now, viewerId, links, params, onParams } = props;
  const [seed, setSeed] = useState(props.randomSeed);
  const locale = useFormatLocale();
  const cards = useMemo(
    () => cardsFrom(entries, now, locale),
    [entries, now, locale]
  );
  const listQuery = params.toString();
  const { query, available, filters, labelIds, labelGroups, sort, rows } =
    useMemo(
      () =>
        directoryView({
          cards,
          params: new URLSearchParams(listQuery),
          meetingsEnabled: props.meetingsEnabled,
          seed,
        }),
      [cards, listQuery, props.meetingsEnabled, seed]
    );
  const { onRows } = props;
  useEffect(() => {
    onRows?.(rows);
    return () => onRows?.(null);
  }, [onRows, rows]);
  const { visible, pager, top } = usePaging<
    (typeof rows)[number],
    HTMLDivElement
  >(rows, params, paramsUpdater(params, onParams), { showTotal: false });
  const sortDisabled = query !== "";
  const onlyHasProfile =
    filters.length === 1 && filters[0] === "hasProfile" && query === "";

  return (
    <>
      <div className="max-w-4xl mx-auto flex flex-col gap-6 px-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">
            <Trans>Attendees</Trans>
          </h1>
          {viewerId && (
            <a href={links.edit} className={`text-sm ${LINK}`}>
              <Trans>Edit profile</Trans>
            </a>
          )}
        </div>

        <div ref={top} className="space-y-4 pb-8">
          <ListToolbar
            search={
              <SearchBox query={query} params={params} onParams={onParams} />
            }
            filters={
              <>
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
                      aria-label={i18n._(
                        FILTER_LABEL[f.value][active ? "ariaActive" : "aria"]
                      )}
                    >
                      {i18n._(FILTER_LABEL[f.value].chip)}
                    </button>
                  );
                })}
                <LabelMenu
                  groups={labelGroups}
                  selected={labelIds}
                  onChange={(next) =>
                    onParams(
                      withParams(params, {
                        labels: next.length > 0 ? next.join(",") : null,
                      }),
                      { push: true }
                    )
                  }
                />
              </>
            }
            sort={
              <Tooltip
                content={
                  sortDisabled
                    ? t`Search results are sorted by relevance`
                    : undefined
                }
              >
                <label className="flex items-center gap-2 text-sm text-fg-muted">
                  <Trans>Sort by</Trans>
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
                        {i18n._(SORT_LABEL[s.value])}
                      </option>
                    ))}
                  </select>
                </label>
              </Tooltip>
            }
            count={
              rows.length > 0
                ? plural(rows.length, {
                    one: "# attendee",
                    other: "# attendees",
                  })
                : null
            }
          />

          {rows.length > 0 ? (
            <>
              <ul className="divide-y divide-line-subtle border-t border-b border-line-subtle">
                {visible.map((row) => (
                  <li key={row.id} className="py-3">
                    <AttendeeRow card={row} href={links.guest(row.id)} />
                  </li>
                ))}
              </ul>
              {pager}
            </>
          ) : entries.length === 0 &&
            (status === "loading" || status === "idle") ? (
            <p role="status" className="text-sm text-fg-subtle">
              <Trans>Loading attendees…</Trans>
            </p>
          ) : status === "error" && entries.length === 0 ? (
            <p role="alert" className="text-sm text-fg-subtle">
              <Trans>
                Could not load the attendees. Reload the page to try again.
              </Trans>
            </p>
          ) : (
            <p className="text-sm text-fg-subtle">
              {onlyHasProfile ? (
                <>
                  <Trans>Nobody has filled in a profile yet.</Trans>
                  {viewerId && (
                    <>
                      {" "}
                      <a href={links.edit} className={LINK}>
                        <Trans>Be the first!</Trans>
                      </a>
                    </>
                  )}
                </>
              ) : (
                t`No attendees match.`
              )}
            </p>
          )}
        </div>
      </div>
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
        placeholder={t`Search names, languages, interests…`}
        aria-label={t`Search`}
        inputClassName="h-10 px-3 text-base sm:text-sm rounded-md border border-line bg-surface-raised placeholder-fg-subtle focus:ring-2 focus:ring-brand-accent focus:border-transparent focus:outline-none"
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
    labels,
    excerpt,
    profileUpdated,
  } = card;
  // Sorting by recency with no visible dates would be opaque. Narrow screens
  // have no room beside the name, so it rides along under it there.
  const updated = profileUpdated && (
    <span className="text-xs text-fg-subtle">
      <Trans>updated {profileUpdated}</Trans>
    </span>
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
              <Trans>Session host</Trans>
            </span>
          )}
          <AttendeeLabels labels={labels} />
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
