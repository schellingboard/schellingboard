import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { msg, plural } from "@lingui/core/macro";
import { describe, expect, it, vi } from "vitest";

import { createTranslators } from "@/server/kernel/translator";

const hello = (name: string) => msg`Hello ${name}`;
const sessions = (count: number) =>
  msg`${plural(count, { one: "# session", other: "# sessions" })}`;
const menuAll = msg({ message: "All", context: "Menu" });
const filterAll = msg({ message: "All", context: "Filter" });

const dir = mkdtempSync(path.join(tmpdir(), "locales-"));
const catalog = (locale: string, po: string[]) => {
  mkdirSync(path.join(dir, locale));
  writeFileSync(path.join(dir, locale, "messages.po"), po.join("\n"));
};
catalog("de", [
  'msgid "Hello {name}"',
  'msgstr "Hallo {name}"',
  "",
  `msgid "{count, plural, one {# session} other {# sessions}}"`,
  'msgstr "{count, plural, one {# Sitzung} other {# Sitzungen}}"',
  "",
  'msgctxt "Menu"',
  'msgid "All"',
  'msgstr "Alles"',
  "",
  'msgctxt "Filter"',
  'msgid "All"',
  'msgstr "Alle"',
  "",
  'msgid "Untranslated"',
  'msgstr ""',
  "",
]);
catalog("en", ['msgid "Hello {name}"', 'msgstr ""', ""]);
catalog("fr", ['msgid "broken', ""]);
const translatorFor = createTranslators(dir);

describe("server translator", { tags: ["022-US2"] }, () => {
  it("translates a message written with the macros using the web's catalogs and ICU", () => {
    const de = translatorFor("de");
    expect(de(hello("Ada"))).toBe("Hallo Ada");
    expect(de(sessions(1))).toBe("1 Sitzung");
    expect(de(sessions(3))).toBe("3 Sitzungen");
  });

  it("tells apart messages that differ only in context", () => {
    const de = translatorFor("de");
    expect(de(menuAll)).toBe("Alles");
    expect(de(filterAll)).toBe("Alle");
  });

  it("reads the source, not the hashed id, in English and when untranslated", () => {
    expect(translatorFor("en")(hello("Ada"))).toBe("Hello Ada");
    expect(translatorFor("de")(msg`Untranslated`)).toBe("Untranslated");
  });

  it("falls back to English for no locale, an unknown one or a broken catalog", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    for (const locale of [null, undefined, "es", "../x", "fr"]) {
      expect(translatorFor(locale)(hello("Ada"))).toBe("Hello Ada");
    }
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it("takes a regional tag for a locale it has", () => {
    expect(translatorFor("de-DE")(hello("Ada"))).toBe("Hallo Ada");
  });
});
