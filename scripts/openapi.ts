import { readFile, writeFile } from "node:fs/promises";
import { format, resolveConfig } from "prettier";
import { openApiDocument } from "../server/http/openapi.ts";

const TARGET = "packages/contracts/openapi.json";

// Formatted like `make format` would, so the two never fight over the file.
const generated = await format(JSON.stringify(openApiDocument()), {
  ...(await resolveConfig(TARGET)),
  filepath: TARGET,
});

if (process.argv.includes("--check")) {
  const committed = await readFile(TARGET, "utf8").catch(() => "");
  if (committed !== generated) {
    console.error(
      `${TARGET} does not match the API. Regenerate and review the API change: make openapi`
    );
    process.exit(1);
  }
} else {
  await writeFile(TARGET, generated);
}
