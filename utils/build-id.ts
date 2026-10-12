import { readFileSync } from "fs";
import path from "path";
import { getAppVersion } from "./git";

let cached: string | undefined;

/** Next writes the id of a production build to `.next/BUILD_ID`. */
export function getBuildId(): string {
  cached ??= readBuildFile() ?? getAppVersion();
  return cached;
}

function readBuildFile(): string | null {
  try {
    const id = readFileSync(
      path.join(process.cwd(), ".next", "BUILD_ID"),
      "utf8"
    ).trim();
    return id || null;
  } catch {
    return null;
  }
}
