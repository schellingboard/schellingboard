import { i18n, type MessageDescriptor } from "@lingui/core";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type { StatsTable } from "@schellingboard/contracts/stats";
import { useState } from "react";

import { cx } from "../../ui/cx";
import { Dialog } from "../../ui/dialog";
import { QuestionMarkCircleIcon } from "../../ui/icons";
import type { Figure } from "./stats-figures";
import { formatCell, SortableStatsTable } from "./stats-table";

export const figureHeadingId = (figure: Figure) => `stats-${figure.key}`;

export const figureTitle = (figure: Figure, table: StatsTable) =>
  figure.title ? i18n._(figure.title) : table.title;

const switchButton =
  "px-2.5 py-1 text-sm font-medium first:rounded-l-md last:rounded-r-md";

function Help({ title, help }: { title: string; help: MessageDescriptor[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={t`About ${title}`}
        onClick={() => setOpen(true)}
        className="rounded-full p-0.5 text-fg-subtle hover:text-fg focus:outline-none focus:ring-2 focus:ring-brand-accent"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-2 text-sm text-fg-muted">
          {help.map((paragraph) => {
            const text = i18n._(paragraph);
            return <p key={text}>{text}</p>;
          })}
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
  const [asTable, setAsTable] = useState(false);
  const title = figureTitle(figure, table);
  const tableTitle = table.title;
  const headingId = figureHeadingId(figure);
  const hasData = table.rows.length > 0 && (figure.hasChart?.(table) ?? true);
  const switchable = Boolean(figure.chart) && !figure.from && hasData;
  const showTable = !figure.chart || (switchable && asTable);

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
              aria-label={t`Show ${title} as`}
              className="flex rounded-md border border-line"
            >
              {[false, true].map((table) => (
                <button
                  key={String(table)}
                  type="button"
                  aria-pressed={asTable === table}
                  onClick={() => setAsTable(table)}
                  className={cx(
                    switchButton,
                    asTable === table
                      ? "bg-surface-sunken text-fg"
                      : "text-fg-subtle hover:text-fg"
                  )}
                >
                  {table
                    ? t({
                        message: "Table",
                        comment: "Button: show the figure as a table",
                      })
                    : t({
                        message: "Chart",
                        comment: "Button: show the figure as a chart",
                      })}
                </button>
              ))}
            </div>
          )}
          {!figure.from && (
            <a
              href={csvUrl}
              download
              aria-label={t`Download CSV of ${tableTitle}`}
              className="rounded-md border border-line px-2.5 py-1 text-sm font-medium text-fg-muted hover:bg-surface-sunken"
            >
              <Trans>CSV</Trans>
            </a>
          )}
        </div>
      </div>
      {!hasData ? (
        <p className="text-sm text-fg-subtle">
          <Trans>No data</Trans>
        </p>
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
