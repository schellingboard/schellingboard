import { i18n, type Messages } from "@lingui/core";
import { I18nProvider as LinguiProvider } from "@lingui/react";
import {
  createContext,
  useContext,
  useEffect,
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

export function I18nProvider({
  stored,
  children,
}: {
  stored?: string | null;
  children: ReactNode;
}) {
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
    <LocaleContext value={active}>
      <LinguiProvider i18n={i18n}>{children}</LinguiProvider>
    </LocaleContext>
  );
}
