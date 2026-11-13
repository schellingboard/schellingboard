import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { generateMessageId } from "@lingui/message-utils/generateMessageId";
import { describe, expect, it, vi } from "vitest";

import { createTranslators } from "@/server/kernel/translator";

// Built the way the msg macro builds them: a hashed id, the source as message.
const descriptor = (
  message: string,
  values: Record<string, unknown> = {},
  context?: string
) => ({ id: generateMessageId(message, context) as string, message, values });

const SESSIONS = "{count, plural, one {# session} other {# sessions}}";

const dir = mkdtempSync(path.join(tmpdir(), "locales-"));
const catalog = (locale: string, po: string[]) => {
  mkdirSync(path.join(dir, locale));
  writeFileSync(path.join(dir, locale, "messages.po"), po.join("\n"));
};
catalog("de", [
  'msgid "Hello {name}"',
  'msgstr "Hallo {name}"',
  "",
  `msgid "${SESSIONS}"`,
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
  it("translates a macro-built message with the web's catalogs and ICU", () => {
    const de = translatorFor("de");
    expect(de(descriptor("Hello {name}", { name: "Ada" }))).toBe("Hallo Ada");
    expect(de(descriptor(SESSIONS, { count: 1 }))).toBe("1 Sitzung");
    expect(de(descriptor(SESSIONS, { count: 3 }))).toBe("3 Sitzungen");
  });

  it("tells apart messages that differ only in context", () => {
    const de = translatorFor("de");
    expect(de(descriptor("All", {}, "Menu"))).toBe("Alles");
    expect(de(descriptor("All", {}, "Filter"))).toBe("Alle");
  });

  it("reads the source, not the hashed id, in English and when untranslated", () => {
    const hello = descriptor("Hello {name}", { name: "Ada" });
    expect(translatorFor("en")(hello)).toBe("Hello Ada");
    expect(translatorFor("de")(descriptor("Untranslated"))).toBe(
      "Untranslated"
    );
  });

  it("falls back to English for no locale, an unknown one or a broken catalog", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const hello = descriptor("Hello {name}", { name: "Ada" });
    for (const locale of [null, undefined, "es", "../x", "fr"]) {
      expect(translatorFor(locale)(hello)).toBe("Hello Ada");
    }
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it("takes a regional tag for a locale it has", () => {
    expect(
      translatorFor("de-DE")(descriptor("Hello {name}", { name: "Ada" }))
    ).toBe("Hallo Ada");
  });
});
