import type { OnParams } from "../ui/list-paging";
import { useUrlSearchParams } from "./use-url-search-params";

/** The address's search params, and a way to change some of them. */
export function useParamUpdates() {
  const { params, change } = useUrlSearchParams();
  const onParams: OnParams = (updates, { push }) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(updates))
      if (value === null) next.delete(key);
      else next.set(key, value);
    change(next, { push });
  };
  return { params, onParams };
}
