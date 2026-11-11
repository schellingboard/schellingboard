import { createContext, useContext } from "react";
import { DEFAULT_LOCALE } from "./locales";
import { formatLocale } from "./format";

export const FormatLocaleContext = createContext<string>(
  formatLocale(DEFAULT_LOCALE, navigator.languages)
);

export const useFormatLocale = () => useContext(FormatLocaleContext);
