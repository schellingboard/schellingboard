import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { type I18n, type MessageDescriptor, setupI18n } from "@lingui/core";
import { compileMessage } from "@lingui/message-utils/compileMessage";
import { generateMessageId as hashedId } from "@lingui/message-utils/generateMessageId";
import {
  DEFAULT_LOCALE,
  supportedLocale,
} from "@schellingboard/domain/locales";
import { parsePoEntries } from "@schellingboard/domain/po-catalog";

const generateMessageId = (msg: string, context?: string) =>
  hashedId(msg, context) as string;

/** `locale` is the language the text comes out in, for formatting dates and lists to match. */
export type Translate = ((message: MessageDescriptor) => string) & {
  locale: string;
};

export const LOCALES_DIR = path.join(process.cwd(), "apps/web/locales");

/** Server-written text in the web's catalogs; anything missing reads as English. */
export function createTranslators(localesDir = LOCALES_DIR) {
  const available = existsSync(localesDir)
    ? readdirSync(localesDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
  const english = (): I18n => {
    const i18n = setupI18n({ locale: DEFAULT_LOCALE, messages: { en: {} } });
    i18n.setMessagesCompiler(compileMessage);
    return i18n;
  };

  const load = (locale: string): I18n => {
    const i18n = english();
    // The catalogs are keyed by source text; the macros emit hashed ids.
    const messages: Record<string, ReturnType<typeof compileMessage>> = {};
    for (const { msgid, context, forms } of parsePoEntries(
      readFileSync(path.join(localesDir, locale, "messages.po"), "utf8")
    )) {
      messages[generateMessageId(msgid, context)] = compileMessage(
        forms[0] || msgid
      );
    }
    i18n.load(locale, messages);
    i18n.activate(locale);
    return i18n;
  };

  const cache = new Map<string, Translate>();
  return (tag: string | null | undefined): Translate => {
    const locale = (tag && supportedLocale(tag, available)) || DEFAULT_LOCALE;
    let translate = cache.get(locale);
    if (!translate) {
      let i18n: I18n;
      try {
        i18n = load(locale);
      } catch (error) {
        console.error(`Could not load the ${locale} catalog:`, error);
        i18n = english();
      }
      translate = Object.assign(
        (message: MessageDescriptor) => i18n._(message),
        { locale: i18n.locale }
      );
      cache.set(locale, translate);
    }
    return translate;
  };
}

export const translatorFor = createTranslators();
