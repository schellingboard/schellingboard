import { useEffect, useRef, useState } from "react";
import { useDebouncedSearch } from "./use-debounced";

/**
 * Search text that is typed locally and kept, debounced, in the `q` param. A
 * `q` changed from outside (a link to the bare page) replaces the typed text.
 */
export function useSearchParamText(
  params: URLSearchParams,
  onParamsChange: (params: URLSearchParams) => void
) {
  const fromAddress = params.get("q") ?? "";
  const [text, setText] = useState(fromAddress);
  const [seen, setSeen] = useState(fromAddress);
  const searched = useDebouncedSearch(text);
  if (seen !== fromAddress) {
    setSeen(fromAddress);
    if (fromAddress !== searched.trim()) setText(fromAddress);
  }
  const latest = useRef({ params, onParamsChange });
  useEffect(() => {
    latest.current = { params, onParamsChange };
  });
  useEffect(() => {
    const { params: current, onParamsChange: change } = latest.current;
    const trimmed = searched.trim();
    if ((current.get("q") ?? "") === trimmed) return;
    const next = new URLSearchParams(current);
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    change(next);
  }, [searched]);
  return [text, setText, searched] as const;
}
