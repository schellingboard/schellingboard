import type { EventStatistics } from "@schellingboard/contracts/stats";
import { SESSION_ORIGINS } from "@schellingboard/domain/stats/session-origin";
import {
  filterFromParams,
  filterToParams,
  statsDownloadUrl,
  type StatsFilter,
} from "../../queries/admin-stats";
import { useId, type ReactNode } from "react";
import { cx } from "../../ui/cx";
import { PeoplePicker } from "../../ui/people-picker";
import type { OnParams } from "./list-paging";
import { FigureCard, figureHeadingId, figureTitle } from "./stats-figure-card";
import { figuresFor } from "./stats-figures";

const SECTION_LABELS: Record<string, string> = {
  overview: "Overview",
  sessions: "Sessions",
  meetings: "1-on-1s",
};

const ORIGIN_LABELS = {
  blocker: "Blockers",
  proposal: "Proposal sessions",
  organizer: "Organizer sessions",
  spontaneous: "Spontaneous sessions",
} as const;

const sectionOf = (tableId: string) => tableId.split("-")[0];

const download =
  "rounded-md border border-line bg-surface-raised px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-surface-sunken";

function toggled<T>(list: T[], item: T, on: boolean) {
  return on ? [...list, item] : list.filter((x) => x !== item);
}

function Picker({
  label,
  options,
  excluded,
  onChange,
}: {
  label: string;
  options: { id: string; name: string }[];
  excluded: string[];
  onChange: (ids: string[]) => void;
}) {
  const id = useId();
  return (
    <div className="min-w-0 space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      <PeoplePicker
        id={id}
        people={options}
        selected={excluded}
        onChange={onChange}
        placeholder="Type to find, or pick from the list"
      />
    </div>
  );
}

function FilterPanel({
  options,
  filter,
  summary,
  onChange,
  download,
}: {
  options: EventStatistics["filterOptions"];
  filter: StatsFilter;
  summary: string;
  onChange: (filter: StatsFilter) => void;
  download: ReactNode;
}) {
  const isDefault = Object.values(filterToParams(filter)).every(
    (value) => value === null
  );
  return (
    <section
      aria-label="Filter"
      className="space-y-3 rounded-md border border-line-subtle p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          <span className="font-medium text-fg">Filter: </span>
          {summary}
        </p>
        <div className="flex items-center gap-3">
          {!isDefault && (
            <button
              type="button"
              onClick={() => onChange(filterFromParams(new URLSearchParams()))}
              className="text-sm font-medium text-fg-muted underline-offset-4 hover:text-fg hover:underline"
            >
              Reset filter
            </button>
          )}
          {download}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <Picker
          label="Locations to leave out"
          options={options.locations}
          excluded={filter.excludeLocations}
          onChange={(ids) => onChange({ ...filter, excludeLocations: ids })}
        />
        <Picker
          label="Hosts to leave out"
          options={options.hosts}
          excluded={filter.excludeHosts}
          onChange={(ids) => onChange({ ...filter, excludeHosts: ids })}
        />
        <fieldset className="min-w-0 space-y-1 md:col-span-2 xl:col-span-1">
          <legend className="text-sm font-medium text-fg">
            Session origins
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-1 xl:flex-col">
            {SESSION_ORIGINS.map((origin) => (
              <label key={origin} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-line"
                  checked={filter.excludeOrigins.includes(origin)}
                  onChange={(e) =>
                    onChange({
                      ...filter,
                      excludeOrigins: SESSION_ORIGINS.filter((o) =>
                        toggled<string>(
                          filter.excludeOrigins,
                          origin,
                          e.target.checked
                        ).includes(o)
                      ),
                    })
                  }
                />
                {ORIGIN_LABELS[origin]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <p className="text-xs text-fg-subtle">
        What you leave out leaves every figure and download. A host also leaves
        the figures about people.
      </p>
    </section>
  );
}

export function EventStatsScreen({
  eventId,
  status,
  stats,
  params,
  onParams,
}: {
  eventId: string;
  status: "loading" | "error" | "ready";
  stats?: EventStatistics;
  params: URLSearchParams;
  onParams: OnParams;
}) {
  const failed = status === "error" || (status === "ready" && !stats);
  const alert = failed && (
    <p role="alert" className="text-sm text-danger-fg">
      Could not load the statistics.
    </p>
  );
  if (!stats) return alert || <p className="text-sm">Loading…</p>;

  const filter = filterFromParams(params);
  const sections = [...new Set(stats.tables.map((t) => sectionOf(t.id)))];
  const requested = params.get("section");
  const section =
    requested && sections.includes(requested) ? requested : sections[0];
  const tables = new Map(stats.tables.map((t) => [t.id, t]));
  const figures = figuresFor(
    stats.tables.filter((t) => sectionOf(t.id) === section)
  ).map((figure) => ({ figure, table: tables.get(figure.table)! }));
  const sectionHref = (key: string) => {
    const next = new URLSearchParams(params);
    next.set("section", key);
    return `?${next.toString().replaceAll("%2C", ",")}`;
  };

  return (
    <div className="space-y-6">
      {alert}
      <FilterPanel
        options={stats.filterOptions}
        filter={filter}
        summary={stats.filterSummary}
        onChange={(next) => onParams(filterToParams(next), { push: false })}
        download={
          <a
            href={statsDownloadUrl(eventId, "stats.zip", filter)}
            download
            className={download}
          >
            Download all
          </a>
        }
      />

      <div className="space-y-6 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-8 lg:space-y-0">
        <div className="space-y-6 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto">
          <nav
            aria-label="Statistics sections"
            className="flex gap-1 overflow-x-auto border-b border-line-subtle lg:flex-col lg:overflow-visible lg:border-b-0"
          >
            {sections.map((key) => (
              <a
                key={key}
                href={sectionHref(key)}
                aria-current={key === section ? "page" : undefined}
                className={cx(
                  "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium lg:mb-0 lg:rounded-md lg:border-b-0",
                  key === section
                    ? "border-line-strong text-fg lg:bg-surface-sunken"
                    : "border-transparent text-fg-subtle hover:border-line hover:text-fg-muted lg:hover:bg-surface-sunken"
                )}
              >
                {SECTION_LABELS[key] ?? key[0].toUpperCase() + key.slice(1)}
              </a>
            ))}
          </nav>
          <nav aria-label="Figures in this section" className="hidden lg:block">
            <ul className="space-y-0.5 border-l border-line-subtle">
              {figures.map(({ figure, table }) => (
                <li key={figure.key}>
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(figureHeadingId(figure))
                        ?.closest("section")
                        ?.scrollIntoView?.({
                          behavior: "smooth",
                          block: "start",
                        })
                    }
                    className="block w-full px-3 py-1 text-left text-xs text-fg-subtle hover:text-fg"
                  >
                    {figureTitle(figure, table)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="min-w-0 space-y-6">
          {section === "attendees" && (
            <p className="text-sm text-fg-muted">
              RSVPs are intent, not attendance: people book more than they
              attend.
            </p>
          )}

          <div className="grid items-start gap-6 xl:grid-cols-2 min-[2200px]:grid-cols-3">
            {figures.map(({ figure, table }) => (
              <FigureCard
                key={figure.key}
                figure={figure}
                table={table}
                csvUrl={statsDownloadUrl(
                  eventId,
                  `stats/${table.id}.csv`,
                  filter
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
