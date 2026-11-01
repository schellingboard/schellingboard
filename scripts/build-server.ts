import { randomUUID } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { build, context, type BuildOptions } from "esbuild";
import { getAppVersion } from "./app-version.js";

const OUT = "dist/server";
const version = process.env.APP_VERSION || getAppVersion();

const options: BuildOptions = {
  entryPoints: ["server/main.ts"],
  outfile: `${OUT}/main.mjs`,
  bundle: true,
  platform: "node",
  format: "esm",
  // Native addons are loaded from node_modules at run time.
  external: ["better-sqlite3", "sharp"],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  define: {
    "process.env.NEXT_PUBLIC_APP_VERSION": JSON.stringify(version),
  },
  logLevel: "info",
};

mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/BUILD_ID`, `${version}-${randomUUID().slice(0, 8)}\n`);
if (process.argv.includes("--watch")) {
  await (await context(options)).watch();
} else {
  await build(options);
}
