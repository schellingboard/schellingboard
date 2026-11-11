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
  { showTotal = true }: { showTotal?: boolean } = {}
) {
  const paging = pageOf(rows, params);
  const { onPage, onPageSize } = tableHandlers(onParams);
  const top = useRef<E>(null);
  const pager = showsPager(paging) && (
    <Pager
      page={paging.page}
      totalPages={paging.lastPage}
      pageSize={paging.pageSize}
      total={paging.total}
      onPage={onPage}
      onPageSize={onPageSize}
      showTotal={showTotal}
      listTop={top}
    />
  );
  return { ...paging, top, pager };
}
