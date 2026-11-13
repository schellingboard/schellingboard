// Runs a script that imports server code using the Lingui macros: tsx cannot
// transform them, so the script is bundled with the same plugin as the server.
//
//     bun x tsx scripts/run-bundled.ts scripts/openapi.ts [args]

import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { build } from "esbuild";

import { linguiEsbuild } from "./lingui-macro.ts";

const [entry, ...args] = process.argv.slice(2);
const outfile = path.resolve(
  "node_modules/.cache/run-bundled",
  `${path.basename(entry, path.extname(entry))}-${process.pid}.mjs`
);
mkdirSync(path.dirname(outfile), { recursive: true });
await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  platform: "node",
  format: "esm",
  banner: {
    js: "import { createRequire as bundleCreateRequire } from 'module'; const require = bundleCreateRequire(import.meta.url);",
  },
  plugins: [
    linguiEsbuild(),
    {
      // Only the repo's own code is bundled: packages load from node_modules.
      name: "external-packages",
      setup(b) {
        b.onResolve({ filter: /^[^./]/ }, (args) =>
          args.path.startsWith("@/") || args.path.startsWith("@schellingboard/")
            ? undefined
            : { path: args.path, external: true }
        );
      },
    },
  ],
  logLevel: "warning",
});
process.argv.splice(1, process.argv.length, entry, ...args);
try {
  await import(pathToFileURL(outfile).href);
} finally {
  rmSync(outfile, { force: true });
}
