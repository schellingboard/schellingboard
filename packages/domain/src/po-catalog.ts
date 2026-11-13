export type Catalog = Map<string, string[]>;

const unquote = (line: string) =>
  JSON.parse(line.slice(line.indexOf('"'))) as string;

export type PoEntry = { msgid: string; context?: string; forms: string[] };

/** Every message of a catalog, header excluded. */
export function parsePoEntries(po: string): PoEntry[] {
  const entries: PoEntry[] = [];
  let id = "";
  let context: string | undefined;
  let forms: string[] = [];
  let target: "ctx" | "id" | "plural" | number | null = null;
  const flush = () => {
    if (id) entries.push({ msgid: id, context, forms });
    id = "";
    context = undefined;
    forms = [];
    target = null;
  };
  for (const line of po.split("\n")) {
    if (line.startsWith("msgctxt ")) {
      flush();
      context = unquote(line);
      target = "ctx";
    } else if (line.startsWith("msgid_plural ")) target = "plural";
    else if (line.startsWith("msgid ")) {
      if (id) flush();
      id = unquote(line);
      target = "id";
    } else if (line.startsWith("msgstr")) {
      const form = /^msgstr\[(\d+)\]/.exec(line);
      target = form ? Number(form[1]) : 0;
      forms[target] = unquote(line);
    } else if (line.startsWith('"')) {
      if (target === "ctx") context += unquote(line);
      else if (target === "id") id += unquote(line);
      else if (typeof target === "number") forms[target] += unquote(line);
    } else if (line.trim() === "") flush();
  }
  flush();
  return entries;
}

/** Message key (context and id) to its translations, one per plural form. */
export function parsePo(po: string): Catalog {
  return new Map(
    parsePoEntries(po).map(({ msgid, context, forms }) => [
      context ? `${context}\u0004${msgid}` : msgid,
      forms,
    ])
  );
}

/** Messages of `source` that `locale` lacks or leaves untranslated. */
export function missingKeys(source: Catalog, locale: Catalog): string[] {
  return [...source.keys()].filter((id) => {
    const forms = locale.get(id);
    return !forms || forms.length === 0 || forms.some((form) => !form);
  });
}
