import { readFileSync } from "fs";
import path from "path";
import { getAppVersion } from "./git";

let cached: string | undefined;

/** The server build (scripts/build-server.ts) writes its id to `dist/server/BUILD_ID`. */
export function getBuildId(): string {
  cached ??= readBuildFile() ?? getAppVersion();
  return cached;
}

function readBuildFile(): string | null {
  try {
    const id = readFileSync(
      path.join(process.cwd(), "dist", "server", "BUILD_ID"),
      "utf8"
    ).trim();
    return id || null;
  } catch {
    return null;
  }
}
