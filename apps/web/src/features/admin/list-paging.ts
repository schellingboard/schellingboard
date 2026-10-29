import { searchParamUpdates } from "../../ui/data-table";

export const LIST_PAGE_SIZE = 25;

export type ParamUpdates = Record<string, string | null>;
export type OnParams = (
  updates: ParamUpdates,
  options: { push: boolean }
) => void;

/** The requested page, clamped into range, and its rows. */
export function pageOf<T>(rows: T[], params: URLSearchParams) {
  const lastPage = Math.max(1, Math.ceil(rows.length / LIST_PAGE_SIZE));
  const page = Math.min(
    Math.max(1, Math.trunc(Number(params.get("page"))) || 1),
    lastPage
  );
  return {
    page,
    visible: rows.slice((page - 1) * LIST_PAGE_SIZE, page * LIST_PAGE_SIZE),
  };
}

/** What a table's search box and pager do to the address. */
export const tableHandlers = (onParams: OnParams) => ({
  onSearch: (query: string, { replace }: { replace: boolean }) =>
    onParams(searchParamUpdates(query), { push: !replace }),
  onPage: (page: number) =>
    onParams({ page: page > 1 ? String(page) : null }, { push: true }),
});

export const byTitleThenId =
  <T extends { id: string }>(title: (row: T) => string) =>
  (a: T, b: T) =>
    title(a).localeCompare(title(b), undefined, { sensitivity: "base" }) ||
    a.id.localeCompare(b.id);
