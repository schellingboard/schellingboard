import { useRef } from "react";
import {
  pageOf,
  showsPager,
  tableHandlers,
  type OnParams,
} from "./list-paging";
import { Pager } from "./pager";

/** A list's page of rows from the address, with the pager that goes under it. */
export function usePaging<T, E extends HTMLElement = HTMLElement>(
  rows: T[],
  params: URLSearchParams,
  onParams: OnParams,
  {
    showTotal = true,
    more = false,
    disabled = false,
  }: { showTotal?: boolean; more?: boolean; disabled?: boolean } = {}
) {
  const paging = pageOf(rows, params);
  const { onPage, onPageSize } = tableHandlers(onParams);
  const top = useRef<E>(null);
  const pager = (showsPager(paging) || (more && paging.total > 0)) && (
    <Pager
      page={paging.page}
      totalPages={paging.lastPage + (more ? 1 : 0)}
      pageSize={paging.pageSize}
      total={paging.total}
      onPage={onPage}
      onPageSize={onPageSize}
      showTotal={showTotal}
      more={more}
      disabled={disabled}
      listTop={top}
    />
  );
  return { ...paging, top, pager };
}
