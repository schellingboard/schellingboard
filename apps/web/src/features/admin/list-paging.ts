import { searchParamUpdates } from "../../ui/data-table";
import { DEFAULT_PAGE_SIZE, PAGE_SIZES, type PageSize } from "../../ui/pager";

export type ParamUpdates = Record<string, string | null>;
export type OnParams = (
  updates: ParamUpdates,
  options: { push: boolean }
) => void;

const pageSizeOf = (params: URLSearchParams): PageSize => {
  const asked = params.get("pageSize");
  if (asked === "all") return "all";
  const size = PAGE_SIZES.find((n) => String(n) === asked);
  return size ?? DEFAULT_PAGE_SIZE;
};

/** The requested page, clamped into range, its size and its rows. */
export function pageOf<T>(rows: T[], params: URLSearchParams) {
  const pageSize = pageSizeOf(params);
  const size = pageSize === "all" ? Math.max(1, rows.length) : pageSize;
  const lastPage = Math.max(1, Math.ceil(rows.length / size));
  const page = Math.min(
    Math.max(1, Math.trunc(Number(params.get("page"))) || 1),
    lastPage
  );
  return {
    page,
    pageSize,
    visible: rows.slice((page - 1) * size, page * size),
  };
}

/** What a table's search box and pager do to the address. */
export const tableHandlers = (onParams: OnParams) => ({
  onSearch: (query: string, { replace }: { replace: boolean }) =>
    onParams(searchParamUpdates(query), { push: !replace }),
  onPage: (page: number) =>
    onParams({ page: page > 1 ? String(page) : null }, { push: true }),
  onPageSize: (size: PageSize) =>
    onParams(
      {
        pageSize: size === DEFAULT_PAGE_SIZE ? null : String(size),
        page: null,
      },
      { push: true }
    ),
});

export const byTitleThenId =
  <T extends { id: string }>(title: (row: T) => string) =>
  (a: T, b: T) =>
    title(a).localeCompare(title(b), undefined, { sensitivity: "base" }) ||
    a.id.localeCompare(b.id);

export const plural = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/** The rows whose title or a host name has the search text, sorted by title. */
export function searchByTitleOrHost<
  T extends { id: string; title: string; hosts: { name: string }[] },
>(rows: T[], params: URLSearchParams) {
  const query = params.get("q")?.trim() ?? "";
  const needle = query.toLowerCase();
  const matching = rows
    .filter(
      (row) =>
        !needle ||
        [row.title, ...row.hosts.map((h) => h.name)].some((text) =>
          text.toLowerCase().includes(needle)
        )
    )
    .sort(byTitleThenId((row) => row.title));
  return { query, matching };
}
