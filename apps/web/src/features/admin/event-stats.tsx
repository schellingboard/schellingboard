import type { EventStatistics } from "@schellingboard/contracts/stats";
import { SESSION_ORIGINS } from "@schellingboard/domain/stats/session-origin";
import {
  filterFromParams,
  filterToParams,
  statsDownloadUrl,
  type StatsFilter,
} from "../../queries/admin-stats";
import { cx } from "../../ui/cx";
import type { OnParams } from "./list-paging";
import { SortableStatsTable } from "./stats-table";

const SECTION_LABELS: Record<string, string> = { overview: "Overview" };

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

function FilterGroup({
  legend,
  options,
  excluded,
  onChange,
}: {
  legend: string;
  options: { id: string; name: string }[];
  excluded: string[];
  onChange: (id: string, excluded: boolean) => void;
}) {
  return (
    <fieldset className="min-w-0 space-y-1">
      <legend className="text-sm font-medium text-fg">{legend}</legend>
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {options.map((option) => (
          <label key={option.id} className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-line"
              checked={excluded.includes(option.id)}
              onChange={(e) => onChange(option.id, e.target.checked)}
            />
            <span>{option.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FilterPanel({
  options,
  filter,
  onChange,
}: {
  options: EventStatistics["filterOptions"];
  filter: StatsFilter;
  onChange: (filter: StatsFilter) => void;
}) {
  return (
    <details className="rounded-md border border-line-subtle p-3">
      <summary className="cursor-pointer text-sm font-medium text-fg">
        Filter
      </summary>
      <p className="mt-2 text-sm text-fg-subtle">
        Ticked locations, hosts and kinds of session are left out of every
        figure.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <FilterGroup
          legend="Locations"
          options={options.locations}
          excluded={filter.excludeLocations}
          onChange={(id, on) =>
            onChange({
              ...filter,
              excludeLocations: toggled(filter.excludeLocations, id, on),
            })
          }
        />
        <FilterGroup
          legend="Hosts"
          options={options.hosts}
          excluded={filter.excludeHosts}
          onChange={(id, on) =>
            onChange({
              ...filter,
              excludeHosts: toggled(filter.excludeHosts, id, on),
            })
          }
        />
        <FilterGroup
          legend="Session origins"
          options={SESSION_ORIGINS.map((id) => ({
            id,
            name: ORIGIN_LABELS[id],
          }))}
          excluded={filter.excludeOrigins}
          onChange={(id, on) =>
            onChange({
              ...filter,
              excludeOrigins: SESSION_ORIGINS.filter((o) =>
                toggled<string>(filter.excludeOrigins, id, on).includes(o)
              ),
            })
          }
        />
      </div>
    </details>
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
  const sectionHref = (key: string) => {
    const next = new URLSearchParams(params);
    next.set("section", key);
    return `?${next.toString().replaceAll("%2C", ",")}`;
  };

  return (
    <div className="space-y-6">
      {alert}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-fg-muted">{stats.filterSummary}</p>
          <a
            href={statsDownloadUrl(eventId, "stats.zip", filter)}
            download
            className={download}
          >
            Download all
          </a>
        </div>
        <FilterPanel
          options={stats.filterOptions}
          filter={filter}
          onChange={(next) => onParams(filterToParams(next), { push: false })}
        />
      </div>

      <nav
        aria-label="Statistics sections"
        className="flex gap-1 overflow-x-auto border-b border-line-subtle"
      >
        {sections.map((key) => (
          <a
            key={key}
            href={sectionHref(key)}
            aria-current={key === section ? "page" : undefined}
            className={cx(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium",
              key === section
                ? "border-line-strong text-fg"
                : "border-transparent text-fg-subtle hover:border-line hover:text-fg-muted"
            )}
          >
            {SECTION_LABELS[key] ?? key[0].toUpperCase() + key.slice(1)}
          </a>
        ))}
      </nav>

      {stats.tables
        .filter((t) => sectionOf(t.id) === section)
        .map((table) => (
          <section key={table.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id={`stats-${table.id}`} className="text-lg font-semibold">
                {table.title}
              </h2>
              <a
                href={statsDownloadUrl(
                  eventId,
                  `stats/${table.id}.csv`,
                  filter
                )}
                download
                aria-label={`Download CSV of ${table.title}`}
                className={download}
              >
                Download CSV
              </a>
            </div>
            <SortableStatsTable table={table} />
          </section>
        ))}
    </div>
  );
}
