import { useState } from "react";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { cx } from "../../ui/cx";
import { Dialog } from "../../ui/dialog";
import { QuestionMarkCircleIcon } from "../../ui/icons";
import type { Figure } from "./stats-figures";
import { SortableStatsTable, formatCell } from "./stats-table";

export const figureHeadingId = (figure: Figure) => `stats-${figure.key}`;

export const figureTitle = (figure: Figure, table: StatsTable) =>
  figure.title ?? table.title;

const switchButton =
  "px-2.5 py-1 text-sm font-medium first:rounded-l-md last:rounded-r-md";

function Help({ title, help }: { title: string; help: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={`About ${title}`}
        onClick={() => setOpen(true)}
        className="rounded-full p-0.5 text-fg-subtle hover:text-fg focus:outline-none focus:ring-2 focus:ring-brand-accent"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-2 text-sm text-fg-muted">
          {help.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Dialog>
    </>
  );
}

function Tiles({ table, label }: { table: StatsTable; label: string }) {
  return (
    <ul
      aria-label={label}
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 2xl:grid-cols-8"
    >
      {table.rows.map((row) => (
        <li
          key={String(row[0])}
          className="rounded-md border border-line-subtle p-3"
        >
          <p
            className={cx(
              "text-2xl font-semibold tabular-nums",
              row[1] === null ? "text-fg-subtle" : "text-fg"
            )}
          >
            {formatCell(row[1], table.columns[1].type)}
          </p>
          <p className="text-sm text-fg-muted">{String(row[0])}</p>
        </li>
      ))}
    </ul>
  );
}

export function FigureCard({
  figure,
  table,
  csvUrl,
}: {
  figure: Figure;
  table: StatsTable;
  csvUrl: string;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const title = figureTitle(figure, table);
  const headingId = figureHeadingId(figure);
  const hasData = table.rows.length > 0 && (figure.hasChart?.(table) ?? true);
  const switchable = Boolean(figure.chart) && !figure.from && hasData;
  const showTable = !figure.chart || (switchable && view === "table");

  return (
    <section
      aria-labelledby={headingId}
      className={cx(
        "min-w-0 scroll-mt-4 space-y-3 rounded-lg border border-line-subtle p-4",
        figure.wide && "col-span-full"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 id={headingId} className="text-base font-semibold text-fg">
            {title}
          </h2>
          {figure.help.length > 0 && <Help title={title} help={figure.help} />}
        </div>
        <div className="flex items-center gap-2">
          {switchable && (
            <div
              role="group"
              aria-label={`Show ${title} as`}
              className="flex rounded-md border border-line"
            >
              {(["chart", "table"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={view === option}
                  onClick={() => setView(option)}
                  className={cx(
                    switchButton,
                    view === option
                      ? "bg-surface-sunken text-fg"
                      : "text-fg-subtle hover:text-fg"
                  )}
                >
                  {option === "chart" ? "Chart" : "Table"}
                </button>
              ))}
            </div>
          )}
          {!figure.from && (
            <a
              href={csvUrl}
              download
              aria-label={`Download CSV of ${table.title}`}
              className="rounded-md border border-line px-2.5 py-1 text-sm font-medium text-fg-muted hover:bg-surface-sunken"
            >
              CSV
            </a>
          )}
        </div>
      </div>
      {!hasData ? (
        <p className="text-sm text-fg-subtle">No data</p>
      ) : figure.tiles ? (
        <Tiles table={table} label={title} />
      ) : showTable ? (
        <SortableStatsTable table={table} labelledBy={headingId} />
      ) : (
        figure.chart?.(table)
      )}
    </section>
  );
}
