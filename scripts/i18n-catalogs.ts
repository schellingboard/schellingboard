export type Catalog = Map<string, string[]>;

const unquote = (line: string) =>
  JSON.parse(line.slice(line.indexOf('"'))) as string;

/** Message id to its translations (one per plural form), header excluded. */
export function parsePo(po: string): Catalog {
  const catalog: Catalog = new Map();
  let id = "";
  let forms: string[] = [];
  let target: "id" | "plural" | number | null = null;
  const flush = () => {
    if (id) catalog.set(id, forms);
    id = "";
    forms = [];
    target = null;
  };
  for (const line of po.split("\n")) {
    if (line.startsWith("msgid_plural ")) target = "plural";
    else if (line.startsWith("msgid ")) {
      flush();
      id = unquote(line);
      target = "id";
    } else if (line.startsWith("msgstr")) {
      const form = /^msgstr\[(\d+)\]/.exec(line);
      target = form ? Number(form[1]) : 0;
      forms[target] = unquote(line);
    } else if (line.startsWith('"')) {
      if (target === "id") id += unquote(line);
      else if (typeof target === "number") forms[target] += unquote(line);
    } else if (line.trim() === "") flush();
  }
  flush();
  return catalog;
}

/** Messages of `source` that `locale` lacks or leaves untranslated. */
export function missingKeys(source: Catalog, locale: Catalog): string[] {
  return [...source.keys()].filter((id) => {
    const forms = locale.get(id);
    return !forms || forms.length === 0 || forms.some((form) => !form);
  });
}
