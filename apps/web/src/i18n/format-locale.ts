import { createContext, useContext, useMemo } from "react";

import { formatList, formatLocale } from "./format";
import { DEFAULT_LOCALE } from "./locales";

export const FormatLocaleContext = createContext<string>(
  formatLocale(DEFAULT_LOCALE, navigator.languages)
);

export const useFormatLocale = () => useContext(FormatLocaleContext);

export function useListFormat() {
  const locale = useFormatLocale();
  return useMemo(
    () => (items: readonly string[]) => formatList(locale, items),
    [locale]
  );
}
