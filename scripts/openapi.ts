import { readFile, writeFile } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";
import { format, resolveConfig } from "prettier";
import { openApiDocument } from "../server/http/openapi.ts";

const DOCUMENT = "packages/contracts/openapi.json";
const CLIENT_TYPES = "packages/api-client/src/schema.ts";

// Formatted like `make format` would, so the two never fight over the files.
async function formatted(path: string, source: string) {
  return format(source, { ...(await resolveConfig(path)), filepath: path });
}

const document = openApiDocument();
const outputs = [
  {
    path: DOCUMENT,
    source: await formatted(DOCUMENT, JSON.stringify(document)),
  },
  {
    path: CLIENT_TYPES,
    source: await formatted(
      CLIENT_TYPES,
      `// Generated from ${DOCUMENT} by \`make openapi\`. Do not edit.\n\n` +
        astToString(
          await openapiTS(document as Parameters<typeof openapiTS>[0])
        )
    ),
  },
];

if (process.argv.includes("--check")) {
  let stale = false;
  for (const { path, source } of outputs) {
    // A Windows checkout with core.autocrlf has CRLF line endings.
    const committed = (await readFile(path, "utf8").catch(() => "")).replace(
      /\r\n/g,
      "\n"
    );
    if (committed !== source) {
      console.error(
        `${path} does not match the API. Regenerate and review the API change: make openapi`
      );
      stale = true;
    }
  }
  if (stale) process.exit(1);
} else {
  for (const { path, source } of outputs) await writeFile(path, source);
}
