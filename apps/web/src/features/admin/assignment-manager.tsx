import { useState, type ReactNode } from "react";
import type { CommandResponse } from "../../commands/runner";
import { useFormMutation } from "../../commands/use-form-mutation";
import {
  BulkActionsBar,
  DataTable,
  searchParamUpdates,
  type Column,
} from "../../ui/data-table";
import { FormErrorSummary } from "../../ui/form-error-summary";
import { cx } from "../../ui/cx";
import { jumpTo, shown } from "./use-section-save";

export const ASSIGNMENT_PAGE_SIZE = 25;

export type AssignFilter = "all" | "assigned" | "not-assigned";

const FILTERS: { value: AssignFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "assigned", label: "Assigned" },
  { value: "not-assigned", label: "Not assigned" },
];

export type ParamUpdates = Record<string, string | null>;

type Row = { id: string; name: string };

const asFilter = (value: string | null): AssignFilter =>
  value === "assigned" || value === "not-assigned" ? value : "all";

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
      aria-label={`Assign ${row.name}`}
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
  onParams: (updates: ParamUpdates, options: { push: boolean }) => void;
  assign: (ids: string[], key: string) => Promise<CommandResponse<unknown>>;
  remove: (ids: string[], key: string) => Promise<CommandResponse<unknown>>;
  onChanged: () => void;
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
    .sort(
      (a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) ||
        a.id.localeCompare(b.id)
    );
  const lastPage = Math.max(
    1,
    Math.ceil(matching.length / ASSIGNMENT_PAGE_SIZE)
  );
  const page = Math.min(
    Math.max(1, Math.trunc(Number(params.get("page"))) || 1),
    lastPage
  );
  const visible = matching.slice(
    (page - 1) * ASSIGNMENT_PAGE_SIZE,
    page * ASSIGNMENT_PAGE_SIZE
  );

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
      <DataTable
        rows={visible}
        columns={[...columns, { header: "Assigned", cell: box }]}
        rowKey={(row) => row.id}
        total={matching.length}
        page={page}
        pageSize={ASSIGNMENT_PAGE_SIZE}
        searchQuery={query}
        onSearch={(q, { replace }) =>
          onParams(searchParamUpdates(q), { push: !replace })
        }
        onPage={(p) =>
          onParams({ page: p > 1 ? String(p) : null }, { push: true })
        }
        searchPlaceholder={searchPlaceholder}
        toolbar={
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() =>
                  onParams(
                    { filter: f.value === "all" ? null : f.value, page: null },
                    { push: true }
                  )
                }
                className={cx(
                  "rounded-md border px-3 py-1 text-sm",
                  filter === f.value
                    ? "border-line-strong bg-surface-inverse text-fg-inverse"
                    : "border-line bg-surface-raised text-fg-muted hover:bg-surface-sunken"
                )}
              >
                {f.label}
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
