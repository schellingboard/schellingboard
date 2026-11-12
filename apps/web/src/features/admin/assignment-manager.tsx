import { i18n, type MessageDescriptor } from "@lingui/core";
import { msg, t } from "@lingui/core/macro";
import { type ReactNode, useState } from "react";

import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";
import { cx } from "../../ui/cx";
import { BulkActionsBar, type Column, DataTable } from "../../ui/data-table";
import { FormErrorSummary } from "../../ui/form-error-summary";
import {
  byTitleThenId,
  type OnParams,
  pageOf,
  tableHandlers,
} from "../../ui/list-paging";
import { jumpTo, shown } from "./use-section-save";

export type AssignFilter = "all" | "assigned" | "not-assigned";

const FILTERS: { kind: AssignFilter; label: MessageDescriptor }[] = [
  {
    kind: "all",
    label: msg({ message: "All", context: "Filter: every row" }),
  },
  { kind: "assigned", label: msg`Assigned` },
  { kind: "not-assigned", label: msg`Not assigned` },
];

type Row = { id: string; name: string };

const asFilter = (value: string | null): AssignFilter =>
  FILTERS.find((f) => f.kind === value)?.kind ?? FILTERS[0].kind;

function AssignBox({
  row,
  assigned,
  disabled,
  assign,
  remove,
  onSettled,
}: {
  row: Row;
  assigned: boolean;
  disabled: boolean;
  assign: (ids: string[], key: string) => Promise<CommandResponse<unknown>>;
  remove: (ids: string[], key: string) => Promise<CommandResponse<unknown>>;
  onSettled: (message: string | null) => void;
}) {
  const rowName = row.name;
  const mutation = useFormMutation({
    call: (key) => (assigned ? remove : assign)([row.id], key),
    explainRefusals: true,
  });
  const toggle = async () => {
    const result = await mutation.submit();
    if (result) onSettled(result.ok ? null : result.message);
  };
  return (
    <input
      type="checkbox"
      checked={assigned}
      disabled={disabled || mutation.pending}
      aria-label={t`Assign ${rowName}`}
      onChange={() => void toggle()}
      className="h-4 w-4 cursor-pointer"
    />
  );
}

/** Guests or locations of one event as a searchable, filterable, paged list with bulk actions. */
export function AssignmentManager<T extends Row>({
  title,
  rows,
  isAssigned,
  searchText,
  searchPlaceholder,
  emptyMessage,
  columns,
  detail,
  params,
  onParams,
  assign,
  remove,
  onChanged,
  extra,
}: {
  title: string;
  rows: T[];
  isAssigned: (row: T) => boolean;
  searchText: (row: T) => string[];
  searchPlaceholder: string;
  emptyMessage: string;
  columns: Column<T>[];
  detail: (row: T) => ReactNode;
  params: URLSearchParams;
  onParams: OnParams;
  assign: (ids: string[], key: string) => Promise<CommandResponse<unknown>>;
  remove: (ids: string[], key: string) => Promise<CommandResponse<unknown>>;
  onChanged: () => void;
  /** Rendered above the list with the ids of the selected rows. */
  extra?: (selectedIds: string[]) => ReactNode;
}) {
  const query = params.get("q")?.trim() ?? "";
  const filter = asFilter(params.get("filter"));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const bulkAssign = useFormMutation({
    call: (key) => assign([...selected], key),
    explainRefusals: true,
  });
  const bulkRemove = useFormMutation({
    call: (key) => remove([...selected], key),
    explainRefusals: true,
  });
  const bulkPending = bulkAssign.pending || bulkRemove.pending;

  // A bulk action must never reach rows the new search or filter hides.
  const listKey = `${query} ${filter}`;
  const [prevListKey, setPrevListKey] = useState(listKey);
  if (listKey !== prevListKey) {
    setPrevListKey(listKey);
    setSelected(new Set());
  }

  const needle = query.toLowerCase();
  const matching = rows
    .filter(
      (row) =>
        (filter === "all" || isAssigned(row) === (filter === "assigned")) &&
        (!needle ||
          searchText(row).some((text) => text.toLowerCase().includes(needle)))
    )
    .sort(byTitleThenId((row) => row.name));
  const { page, pageSize, visible } = pageOf(matching, params);

  const settled = (message: string | null) => {
    setError(message);
    onChanged();
  };

  const runBulk = async (doAssign: boolean) => {
    if (selected.size === 0) return;
    setError(null);
    const result = await (doAssign ? bulkAssign : bulkRemove).submit();
    if (!result) return;
    if (result.ok) setSelected(new Set());
    settled(result.ok ? null : result.message);
  };

  const box = (row: T) => (
    <AssignBox
      key={row.id}
      row={row}
      assigned={isAssigned(row)}
      disabled={bulkPending}
      assign={assign}
      remove={remove}
      onSettled={settled}
    />
  );

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  return (
    <section aria-label={title} className="space-y-4">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      <FormErrorSummary fields={{}} error={shown(error)} onJump={jumpTo} />
      {extra?.([...selected])}
      <DataTable
        rows={visible}
        columns={[...columns, { header: t`Assigned`, cell: box }]}
        rowKey={(row) => row.id}
        total={matching.length}
        page={page}
        pageSize={pageSize}
        searchQuery={query}
        {...tableHandlers(onParams)}
        searchPlaceholder={searchPlaceholder}
        toolbar={
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.kind}
                type="button"
                onClick={() =>
                  onParams(
                    { filter: f.kind === "all" ? null : f.kind, page: null },
                    { push: true }
                  )
                }
                className={cx(
                  "rounded-md border px-3 py-1 text-sm",
                  filter === f.kind
                    ? "border-line-strong bg-surface-inverse text-fg-inverse"
                    : "border-line bg-surface-raised text-fg-muted hover:bg-surface-sunken"
                )}
              >
                {i18n._(f.label)}
              </button>
            ))}
          </div>
        }
        bulkBar={
          <BulkActionsBar
            selectedCount={selected.size}
            isPending={bulkPending}
            onAssign={() => void runBulk(true)}
            onRemove={() => void runBulk(false)}
            onClear={() => setSelected(new Set())}
          />
        }
        selection={{
          selectedKeys: selected,
          onToggleRow: toggleRow,
          onToggleAllOnPage: (keys, select) =>
            setSelected((prev) => {
              const next = new Set(prev);
              for (const key of keys)
                if (select) next.add(key);
                else next.delete(key);
              return next;
            }),
          rowLabel: (row) => row.name,
        }}
        emptyMessage={emptyMessage}
        mobileCard={(row) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">{detail(row)}</div>
            {box(row)}
          </div>
        )}
      />
    </section>
  );
}
