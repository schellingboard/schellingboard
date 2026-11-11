import { describe, expect, it } from "vitest";
import { missingKeys, parsePo } from "@/scripts/i18n-catalogs";

const header = 'msgid ""\nmsgstr ""\n"Language: de-DE\\n"\n\n';

describe("parsePo", { tags: ["022-US1"] }, () => {
  it("reads messages, joins continued strings and skips the header", () => {
    const po = `${header}#: a.tsx:1
msgid "Save"
msgstr "Speichern"

msgid ""
"Save "
"all"
msgstr ""
"Alles "
"speichern"
`;
    expect(parsePo(po)).toEqual(
      new Map([
        ["Save", ["Speichern"]],
        ["Save all", ["Alles speichern"]],
      ])
    );
  });

  it("reads each form of a plural", () => {
    const po = `${header}msgid "{n} reply"
msgid_plural "{n} replies"
msgstr[0] "{n} Antwort"
msgstr[1] ""
`;
    expect(parsePo(po).get("{n} reply")).toEqual(["{n} Antwort", ""]);
  });
});

describe("missingKeys", { tags: ["022-US1"] }, () => {
  const source = parsePo(`${header}msgid "A"
msgstr "A"

msgid "B"
msgstr "B"
`);

  it("lists messages the locale lacks or leaves empty", () => {
    const de = parsePo(`${header}msgid "A"
msgstr ""
`);
    expect(missingKeys(source, de)).toEqual(["A", "B"]);
  });

  it("is empty when everything is translated", () => {
    const de = parsePo(`${header}msgid "A"
msgstr "a"

msgid "B"
msgstr "b"
`);
    expect(missingKeys(source, de)).toEqual([]);
  });
});
