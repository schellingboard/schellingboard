import { i18n, type Messages } from "@lingui/core";
import { I18nProvider as LinguiProvider } from "@lingui/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { messages as sourceMessages } from "../../locales/en/messages.po";
import { DEFAULT_LOCALE, resolveLocale, type Locale } from "./locales";

// The source catalog is part of the main bundle so the app starts, and works
// offline, without a second request. Other locales load on demand.
i18n.loadAndActivate({ locale: DEFAULT_LOCALE, messages: sourceMessages });

const lazyCatalogs = import.meta.glob<{ messages: Messages }>([
  "../../locales/*/messages.po",
  "!../../locales/en/messages.po",
]);

export async function activate(locale: string) {
  if (locale !== DEFAULT_LOCALE) {
    const { messages } =
      await lazyCatalogs[`../../locales/${locale}/messages.po`]();
    i18n.loadAndActivate({ locale, messages });
  } else {
    i18n.activate(locale);
  }
  document.documentElement.lang = locale;
}

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export const useLocale = () => useContext(LocaleContext);

const STORED = "sb-locale";

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
  const wanted = resolveLocale(stored, navigator.languages);
  const [active, setActive] = useState<Locale>(DEFAULT_LOCALE);
  useEffect(() => {
    let current = true;
    activate(wanted).then(
      () => current && setActive(wanted),
      () => {} // the locale in use stays active
    );
    return () => {
      current = false;
    };
  }, [wanted]);
  return (
    <StoredLocaleContext value={choice}>
      <LocaleContext value={active}>
        <LinguiProvider i18n={i18n}>{children}</LinguiProvider>
      </LocaleContext>
    </StoredLocaleContext>
  );
}
