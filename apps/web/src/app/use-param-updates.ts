import { paramsUpdater } from "../ui/list-paging";
import { useUrlSearchParams } from "./use-url-search-params";

/** The address's search params, and a way to change some of them. */
export function useParamUpdates() {
  const { params, change } = useUrlSearchParams();
  return { params, onParams: paramsUpdater(params, change) };
}
