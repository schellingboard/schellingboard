import { readFile } from "node:fs/promises";
import path from "node:path";

import { getConfig } from "@lingui/conf";
import type { Plugin as EsbuildPlugin } from "esbuild";

const MACRO_IMPORT = /from ['"]@lingui\/(?:core|react)\/macro['"]/;
const SOURCE_FILE = /\.[cm]?[jt]sx?$/;

type Transformed = { code: string; map?: unknown };
let loaded: Promise<(code: string, filename: string) => Promise<Transformed>>;
const macroTransform = (code: string, filename: string) => {
  loaded ??= (async () => {
    const { transform, mapMacroOptions } = await import("@lingui/native-tools");
    const config = getConfig({
      configPath: path.join(
        import.meta.dirname,
        "../apps/web/lingui.config.ts"
      ),
    });
    // The fallback text stays in the descriptor: an untranslated message
    // reads as its source, so the server must not drop it in production.
    const macro = mapMacroOptions(config, { descriptorFields: "all" });
    return (source, name) => transform(source, name, { macro });
  })();
  return loaded.then((run) => run(code, filename));
};

export const linguiEsbuild = (): EsbuildPlugin => ({
  name: "lingui-macro",
  setup(build) {
    build.onLoad({ filter: SOURCE_FILE }, async ({ path: file }) => {
      if (file.includes("node_modules")) return undefined;
      const source = await readFile(file, "utf8");
      if (!MACRO_IMPORT.test(source)) return undefined;
      return {
        contents: (await macroTransform(source, file)).code,
        loader: file.endsWith("x") ? "tsx" : "ts",
      };
    });
  },
});

export const linguiVitest = () => ({
  name: "lingui-macro",
  enforce: "pre" as const,
  async transform(code: string, id: string) {
    const file = id.replace(/\?.*$/, "");
    if (file.includes("node_modules") || !SOURCE_FILE.test(file)) return null;
    if (!MACRO_IMPORT.test(code)) return null;
    return macroTransform(code, file);
  },
});
