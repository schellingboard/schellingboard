import { i18n, type Messages } from "@lingui/core";
import { I18nProvider as LinguiProvider } from "@lingui/react";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Settings } from "luxon";
import { messages as sourceMessages } from "../../locales/en/messages.po";
import { formatLocale } from "./format";
import { FormatLocaleContext } from "./format-locale";
import { expandMessages } from "./pseudo";
import {
  DEFAULT_LOCALE,
  PSEUDO_LOCALE,
  resolveLocale,
  type Locale,
} from "./locales";

// The source catalog is part of the main bundle so the app starts, and works
// offline, without a second request. Other locales load on demand.
i18n.loadAndActivate({ locale: DEFAULT_LOCALE, messages: sourceMessages });

const lazyCatalogs = import.meta.glob<{ messages: Messages }>([
  "../../locales/*/messages.po",
  "!../../locales/en/messages.po",
  "!../../locales/pseudo-LOCALE/messages.po",
]);
const pseudoCatalog = import.meta.env.DEV
  ? import.meta.glob<{ messages: Messages }>(
      "../../locales/pseudo-LOCALE/messages.po"
    )
  : {};

export async function activate(locale: string) {
  if (locale !== DEFAULT_LOCALE) {
    const { messages } = await { ...lazyCatalogs, ...pseudoCatalog }[
      `../../locales/${locale}/messages.po`
    ]();
    i18n.loadAndActivate({
      locale,
      messages: locale === PSEUDO_LOCALE ? expandMessages(messages) : messages,
    });
  } else {
    i18n.activate(locale);
  }
  document.documentElement.lang = locale;
}

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export { useFormatLocale } from "./format-locale";

export const useLocale = () => useContext(LocaleContext);

const STORED = "sb-locale";

// A switch of its own: the server's answer rewrites the stored locale on every load.
const pseudoRequested = () => {
  try {
    return import.meta.env.DEV && localStorage.getItem("sb-pseudo") === "1";
  } catch {
    return false;
  }
};

const rememberedLocale = () => {
  try {
    return localStorage.getItem(STORED);
  } catch {
    return null;
  }
};

type StoredLocale = {
  stored: string | null;
  setStored: (locale: string | null) => void;
};

const StoredLocaleContext = createContext<StoredLocale>({
  stored: null,
  setStored: () => {},
});

/** The language the signed-in guest chose; null follows the browser. */
export const useStoredLocale = () => useContext(StoredLocaleContext);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Kept on the device too, so the first paint and an offline start use it.
  const [stored, setStoredState] = useState<string | null>(rememberedLocale);
  const setStored = useCallback((locale: string | null) => {
    setStoredState(locale);
    try {
      if (locale) localStorage.setItem(STORED, locale);
      else localStorage.removeItem(STORED);
    } catch {
      // The choice then lasts until the page is reloaded.
    }
  }, []);
  const choice = useMemo(() => ({ stored, setStored }), [stored, setStored]);
  const wanted = pseudoRequested()
    ? (PSEUDO_LOCALE as Locale)
    : resolveLocale(stored, navigator.languages);
  const [active, setActive] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    let current = true;
    activate(wanted).then(
      () => {
        if (!current) return;
        // Luxon names months and weekdays in this locale; set before the re-render that formats.
        Settings.defaultLocale = formatLocale(wanted, navigator.languages);
        setActive(wanted);
      },
      () => {} // the locale in use stays active
    );
    return () => {
      current = false;
    };
  }, [wanted]);
  const formatting = formatLocale(active, navigator.languages);
  useState(() => {
    Settings.defaultLocale = formatting;
  });
  return (
    <StoredLocaleContext value={choice}>
      <LocaleContext value={active}>
        <FormatLocaleContext value={formatting}>
          <LinguiProvider i18n={i18n}>
            <Fragment key={active}>{children}</Fragment>
          </LinguiProvider>
        </FormatLocaleContext>
      </LocaleContext>
    </StoredLocaleContext>
  );
}
