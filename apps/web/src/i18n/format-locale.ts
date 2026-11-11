import { createContext, useContext } from "react";

import { formatLocale } from "./format";
import { DEFAULT_LOCALE } from "./locales";

export const FormatLocaleContext = createContext<string>(
  formatLocale(DEFAULT_LOCALE, navigator.languages)
);

export const useFormatLocale = () => useContext(FormatLocaleContext);
