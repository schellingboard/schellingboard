import { randomUUID } from "crypto";
import { build, type BuildOptions, context } from "esbuild";
import { mkdirSync, writeFileSync } from "fs";

import { getAppVersion } from "./app-version.js";
import { linguiEsbuild } from "./lingui-macro.js";

const OUT = "dist/server";
const version = process.env.APP_VERSION || getAppVersion();

const options: BuildOptions = {
  entryPoints: { main: "server/main.ts", demo: "server/demo/main.ts" },
  outdir: OUT,
  outExtension: { ".js": ".mjs" },
  bundle: true,
  platform: "node",
  format: "esm",
  // Native addons are loaded from node_modules at run time.
  external: ["better-sqlite3", "sharp"],
  banner: {
    js: "import { createRequire as bundleCreateRequire } from 'module'; const require = bundleCreateRequire(import.meta.url);",
  },
  define: {
    "process.env.NEXT_PUBLIC_APP_VERSION": JSON.stringify(version),
  },
  plugins: [linguiEsbuild()],
  logLevel: "info",
};

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/BUILD_ID`, `${version}-${randomUUID().slice(0, 8)}\n`);
if (process.argv.includes("--watch")) {
  await (await context(options)).watch();
} else {
  await build(options);
}
