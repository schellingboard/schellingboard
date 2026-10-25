import { useMemo, useState, type ComponentType } from "react";
import type { Snapshot } from "@schellingboard/contracts/snapshot";
import { inSchedPhase, inVotingPhase } from "@schellingboard/domain/phase";
import { durationMinusBreak } from "@schellingboard/domain/slots";
import { formatDuration } from "@schellingboard/domain/time";
import type { VoteChoice } from "@schellingboard/domain/vote";
import {
  NO_VOTE_LABEL,
  voteChoiceToEmoji,
  voteChoiceToLabel,
} from "@schellingboard/domain/vote-display";
import { ownVotesFrom, toEvent } from "../../replica/selectors";
import {
  CalendarDaysIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClockIcon,
  EyeSlashIcon,
  HandRaisedIcon,
  PencilIcon,
  PlusIcon,
  UserIcon,
} from "../../ui/icons";
import { SearchInput } from "../../ui/search-input";
import { Unavailable } from "../../ui/unavailable";
import { useDebouncedSearch } from "../../ui/use-debounced";
import { cx } from "../../ui/cx";
import type { ProposalLinks } from "./links";
import { VoteTally } from "./vote-tally";
import { VotingButtons } from "./voting-buttons";
import type { Standing } from "../../queries/proposal-standings";
import {
  defaultSort,
  effectiveFilter,
  filteredRows,
  listRows,
  phaseTexts,
  rowsFrom,
  sortOptions,
  type Filter,
  type Row,
  type Sort,
  type SortKey,
} from "./list-model";

export type ProposalsScreenProps = {
  snapshot: Snapshot;
  links: ProposalLinks;
  now: Date;
  localZone: string | null;
  standings: ReadonlyMap<string, Standing>;
  /** Null withdraws. A failure is reported as a notice, not returned. */
  onVote: (proposalId: string, choice: VoteChoice | null) => void;
};

const LINK = "hover:text-link transition-colors";

export function ProposalsScreen(props: ProposalsScreenProps) {
  const { snapshot, links, now, localZone } = props;
  const event = toEvent(snapshot.event);
  const guestId = snapshot.me?.guestId ?? null;
  const texts = phaseTexts(snapshot.event, now, !!guestId, localZone);
  const votingEnabled = !!guestId && inVotingPhase(event, now);
  const schedEnabled = inSchedPhase(event, now);
  const proposingEnabled = !!guestId && !schedEnabled;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {snapshot.event.name}: Session Proposals
        </h1>
        <p className="text-fg-muted mt-2">
          Browse session ideas or add your own proposal
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center my-6">
          <ActionLink
            href={links.add}
            enabled={proposingEnabled}
            why={texts.proposing}
            icon={PlusIcon}
            label="Add Proposal"
          />
          <ActionLink
            href={links.quickVoting}
            enabled={votingEnabled}
            why={texts.voting}
            icon={ChartBarIcon}
            label="Go to Quick Voting!"
          />
          <ActionLink
            href={links.schedule}
            enabled={schedEnabled}
            why={texts.scheduling}
            icon={CalendarDaysIcon}
            label="View Schedule"
          />
        </div>
      </div>
      {snapshot.proposals.length === 0 ? (
        <div className="text-center py-12 bg-surface-sunken rounded-lg">
          <h2 className="text-xl font-medium text-fg-muted">
            No proposals yet
          </h2>
          <p className="text-fg-subtle mt-2">
            Be the first to suggest a session!
          </p>
          <a
            href={links.add}
            className="mt-4 inline-block bg-brand text-on-brand px-4 py-2 rounded-md hover:bg-brand-hover"
          >
            Add Proposal
          </a>
        </div>
      ) : (
        <ProposalTable
          {...props}
          texts={texts}
          votingEnabled={votingEnabled}
          schedEnabled={schedEnabled}
        />
      )}
    </div>
  );
}

function ActionLink({
  href,
  enabled,
  why,
  icon: Icon,
  label,
}: {
  href: string;
  enabled: boolean;
  why: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Unavailable blocked={!enabled} why={why}>
      <a
        href={enabled ? href : "#"}
        className={cx(
          "bg-brand hover:bg-brand-hover transition-colors text-on-brand px-4 py-2 rounded-md flex items-center gap-2",
          !enabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </a>
    </Unavailable>
  );
}

function ProposalTable({
  snapshot,
  links,
  now,
  standings,
  onVote,
  texts,
  votingEnabled,
  schedEnabled,
}: ProposalsScreenProps & {
  texts: ReturnType<typeof phaseTexts>;
  votingEnabled: boolean;
  schedEnabled: boolean;
}) {
  const guestId = snapshot.me?.guestId ?? null;
  const rows = useMemo(() => rowsFrom(snapshot), [snapshot]);
  const votes = useMemo(() => ownVotesFrom(snapshot), [snapshot]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(undefined);
  const [sort, setSort] = useState<Sort>(() =>
    defaultSort(snapshot.event, now)
  );
  const effective = effectiveFilter(filter, guestId);
  const searching = query.trim() !== "";
  const searched = useDebouncedSearch(query);
  const filteredCount = useMemo(
    () => filteredRows(rows, { filter, guestId, votes }).length,
    [rows, filter, guestId, votes]
  );
  const shown = useMemo(
    () =>
      listRows({
        rows,
        guestId,
        votes,
        standings,
        query: searched,
        filter,
        sort,
      }),
    [rows, guestId, votes, standings, searched, filter, sort]
  );
  const toggle = (next: Filter) =>
    setFilter((old) => (old === next ? undefined : next));
  const sortBy = (key: SortKey) =>
    setSort((old) => ({
      key,
      direction: old.key === key && old.direction === "asc" ? "desc" : "asc",
    }));
  const canEdit = (row: Row) =>
    row.hosts.length === 0 || row.hosts.some((h) => h.id === guestId);
  const duration = (row: Row) =>
    row.durationMinutes
      ? formatDuration(
          durationMinusBreak(
            row.durationMinutes,
            snapshot.event.breakMinutes ?? 0
          )
        )
      : null;
  const voteControls = (row: Row) =>
    guestId && !row.hosts.some((h) => h.id === guestId) ? (
      <VotingButtons
        chosen={votes.get(row.id)}
        enabled={votingEnabled}
        why={texts.voting}
        onVote={(choice) =>
          onVote(row.id, choice === votes.get(row.id) ? null : choice)
        }
      />
    ) : null;
  const actions = (row: Row, compact: boolean) =>
    canEdit(row) ? (
      <RowActions
        edit={links.edit(row.id)}
        schedule={links.scheduleProposal(row.id)}
        schedEnabled={schedEnabled}
        why={texts.scheduling}
        compact={compact}
      />
    ) : null;
  const yourVote = (row: Row) => {
    const choice = votes.get(row.id);
    return (
      <span title={choice ? voteChoiceToLabel(choice) : NO_VOTE_LABEL}>
        {choice ? voteChoiceToEmoji(choice) : ""}
      </span>
    );
  };
  const filterButton = (
    key: NonNullable<Filter>,
    label: string,
    describes: string,
    icon: ComponentType<{ className?: string }>,
    available: boolean,
    why: string
  ) => (
    <FilterButton
      label={label}
      describes={describes}
      icon={icon}
      available={available}
      why={why}
      active={effective === key}
      count={filteredCount}
      onClick={() => toggle(key)}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="lg:flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-fg-muted">Filters:</span>
            <span className="text-xs text-fg-subtle">
              ({shown.length} result{shown.length !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterButton(
              "mine",
              "My proposals",
              "your proposals",
              UserIcon,
              !!guestId,
              "Select a user first"
            )}
            {filterButton(
              "unvoted",
              "Only unvoted",
              "unvoted proposals",
              EyeSlashIcon,
              votingEnabled,
              texts.voting
            )}
            {filterButton(
              "voted",
              "Only voted",
              "voted proposals",
              CheckCircleIcon,
              votingEnabled,
              texts.voting
            )}
            {filterButton(
              "hostWanted",
              "Host wanted",
              "proposals that want a host",
              HandRaisedIcon,
              true,
              ""
            )}
            {effective && (
              <button
                onClick={() => setFilter(undefined)}
                className="text-xs text-fg-subtle hover:text-fg-muted px-2 py-1 rounded border border-line bg-surface-raised hover:bg-surface-sunken transition-colors inline-flex items-center gap-1"
                aria-label="Clear all active filters"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        <div className="lg:w-80">
          <SearchInput
            placeholder="Search proposals..."
            inputClassName="p-3 border border-line rounded-md focus:ring-2 focus:ring-brand-accent focus:border-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery("")}
          />
        </div>
      </div>

      <div
        className="flex items-center justify-between md:justify-end gap-2 text-sm text-fg-muted"
        title={searching ? "Search results are sorted by relevance" : undefined}
      >
        <label htmlFor="proposal-sort">Sort by</label>
        <select
          id="proposal-sort"
          disabled={searching}
          value={`${sort.key}-${sort.direction}`}
          onChange={(e) => {
            const [key, direction] = e.target.value.split("-") as [
              SortKey,
              Sort["direction"],
            ];
            setSort({ key, direction });
          }}
          className="pl-2 pr-9 py-1.5 text-sm rounded-md border border-line bg-surface-raised disabled:bg-surface-muted disabled:text-fg-subtle"
        >
          {sortOptions(snapshot.event, now).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="table-fixed w-full divide-y divide-line-subtle min-w-0">
          <thead className="bg-surface-sunken">
            <tr>
              <SortHeader
                column="title"
                label="Title"
                width={schedEnabled ? "w-[18%]" : "w-[20%]"}
                sort={sort}
                sorting={!searching}
                onSort={sortBy}
              />
              <SortHeader
                column="hosts"
                label="Host(s)"
                width="w-[15%]"
                sort={sort}
                sorting={!searching}
                onSort={sortBy}
              />
              <PlainHeader label="Description" width="w-[20%]" />
              <SortHeader
                column="durationMinutes"
                label="Duration"
                width="w-[10%]"
                sort={sort}
                sorting={!searching}
                onSort={sortBy}
              />
              <SortHeader
                column="userVote"
                label="Your vote"
                width={schedEnabled ? "w-[7%]" : "w-[15%]"}
                sort={sort}
                sorting={!searching}
                onSort={sortBy}
              />
              {schedEnabled && (
                <SortHeader
                  column="votes"
                  label="Votes"
                  width="w-[10%]"
                  sort={sort}
                  sorting={!searching}
                  onSort={sortBy}
                />
              )}
              <PlainHeader label="Actions" width="w-[20%]" />
            </tr>
          </thead>
          <tbody className="bg-surface-raised divide-y divide-line-subtle">
            {shown.map((row) => (
              <tr key={row.id} className="hover:bg-surface-hover">
                <td className="px-4 lg:px-6 py-4" title={row.title}>
                  <a href={links.view(row.id)} className="block w-full">
                    <div className="text-sm font-medium text-fg hover:text-link transition-colors line-clamp-2 leading-tight">
                      {row.title}
                    </div>
                  </a>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-fg-subtle">
                  <div className="truncate">
                    {row.hosts.length === 0 ? (
                      <span className="italic">No host yet</span>
                    ) : (
                      row.hosts.map((h, i) => (
                        <span key={h.id}>
                          {i > 0 && ", "}
                          <a href={links.guest(h.id)} className={LINK}>
                            {h.name}
                          </a>
                        </span>
                      ))
                    )}
                  </div>
                  {row.cohostWanted && (
                    <div className="text-xs italic">Co-host wanted</div>
                  )}
                </td>
                <td className="px-4 lg:px-6 py-4" title={row.plainDescription}>
                  <div className="text-sm text-fg-subtle line-clamp-2 leading-tight">
                    {row.plainDescription || "-"}
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4">
                  <Duration text={duration(row)} />
                </td>
                {schedEnabled ? (
                  <>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      {yourVote(row)}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <VoteTally
                        tally={standings.get(row.id)?.tally ?? null}
                        className="flex-wrap"
                      />
                    </td>
                  </>
                ) : (
                  <td className="px-4 lg:px-6 py-4">{voteControls(row)}</td>
                )}
                <td className="px-4 lg:px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {actions(row, true)}
                  </div>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td
                  colSpan={schedEnabled ? 7 : 6}
                  className="px-4 lg:px-6 py-4 text-center text-sm text-fg-subtle"
                >
                  No proposals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="block md:hidden space-y-4">
        {shown.map((row) => (
          <div
            key={row.id}
            className="bg-surface-raised border border-line-subtle rounded-lg p-4 hover:bg-surface-sunken relative"
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-medium text-fg">
                  <a
                    href={links.view(row.id)}
                    className={cx(LINK, "after:absolute after:inset-0")}
                  >
                    {row.title}
                  </a>
                </h3>
                <p className="text-sm text-fg-subtle mt-1">
                  {row.hosts.length === 0 ? (
                    <span className="italic">No host yet</span>
                  ) : (
                    `Host(s): ${row.hostNames.join(", ")}`
                  )}
                  {row.cohostWanted && (
                    <span className="italic"> · Co-host wanted</span>
                  )}
                </p>
              </div>
              {row.plainDescription ? (
                <p className="text-sm text-fg-muted line-clamp-3">
                  {row.plainDescription}
                </p>
              ) : (
                <p className="text-sm text-fg-subtle">-</p>
              )}
              <Duration text={duration(row)} />
              <div className="pt-2 border-t border-line-subtle space-y-3">
                {!schedEnabled && (
                  <div className="relative z-10">{voteControls(row)}</div>
                )}
                {schedEnabled && (
                  <>
                    {!canEdit(row) && (
                      <div>
                        Your vote:
                        <span className="ml-1">{yourVote(row)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      Total votes:
                      <VoteTally tally={standings.get(row.id)?.tally ?? null} />
                    </div>
                  </>
                )}
                <div className="flex gap-2 relative z-10">
                  {actions(row, false)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && (
          <div className="text-center py-8 text-sm text-fg-subtle">
            No proposals found
          </div>
        )}
      </div>
    </div>
  );
}

function Duration({ text }: { text: string | null }) {
  return text ? (
    <div className="flex items-center">
      <ClockIcon className="h-4 w-4 mr-1 text-fg-subtle flex-shrink-0" />
      <span className="text-sm text-fg-subtle">{text}</span>
    </div>
  ) : (
    <div className="text-sm text-fg-subtle">-</div>
  );
}

function RowActions({
  edit,
  schedule,
  schedEnabled,
  why,
  compact,
}: {
  edit: string;
  schedule: string;
  schedEnabled: boolean;
  why: string;
  compact: boolean;
}) {
  const css = cx(
    "inline-flex items-center justify-center font-medium rounded-md border border-brand-accent text-brand-fg hover:bg-brand-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors",
    compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
  );
  const icon = cx(compact ? "h-3 w-3" : "h-4 w-4", "mr-1");
  const scheduleLink = (
    <Unavailable blocked={!schedEnabled} why={why}>
      <a
        href={schedEnabled ? schedule : "#"}
        className={cx(css, !schedEnabled && "opacity-50 cursor-not-allowed")}
      >
        <CalendarIcon className={icon} />
        Schedule
      </a>
    </Unavailable>
  );
  return (
    <>
      <a href={edit} className={css}>
        <PencilIcon className={icon} />
        Edit
      </a>
      {scheduleLink}
    </>
  );
}

function FilterButton({
  label,
  describes,
  icon: Icon,
  available,
  why,
  active,
  count,
  onClick,
}: {
  label: string;
  describes: string;
  icon: ComponentType<{ className?: string }>;
  available: boolean;
  why: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <Unavailable blocked={!available} why={why}>
      <button
        className={cx(
          "aria-disabled:opacity-50 aria-disabled:cursor-not-allowed text-sm px-3 py-2 rounded-md transition-colors inline-flex items-center gap-2",
          active
            ? "bg-info text-on-info hover:bg-info-hover"
            : "bg-surface-muted text-fg-muted",
          !active && available && "hover:bg-surface-hover"
        )}
        onClick={onClick}
        aria-pressed={active}
        aria-label={`Filter to show only ${describes}`}
      >
        <Icon className="h-4 w-4" />
        {label}
        {active && (
          <span className="bg-info-hover text-on-info text-xs px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </button>
    </Unavailable>
  );
}

const HEADER_CSS =
  "px-4 lg:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider";

function PlainHeader({ label, width }: { label: string; width: string }) {
  return (
    <th scope="col" className={cx(width, HEADER_CSS, "text-fg-subtle")}>
      {label}
    </th>
  );
}

function SortHeader({
  column,
  label,
  width,
  sort,
  sorting,
  onSort,
}: {
  column: SortKey;
  label: string;
  width: string;
  sort: Sort;
  sorting: boolean;
  onSort: (column: SortKey) => void;
}) {
  const active = sorting && sort.key === column;
  const indicator = !sorting
    ? ""
    : active
      ? sort.direction === "asc"
        ? " ↓"
        : " ↑"
      : " ↑↓";
  return (
    <th
      scope="col"
      onClick={() => onSort(column)}
      className={cx(
        width,
        HEADER_CSS,
        "cursor-pointer hover:bg-surface-hover",
        active ? "text-fg font-semibold" : "text-fg-subtle"
      )}
    >
      {label}
      {indicator}
    </th>
  );
}
