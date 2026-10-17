import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function buildIdIn(cwd: string) {
  vi.spyOn(process, "cwd").mockReturnValue(cwd);
  vi.resetModules();
  return (await import("@/utils/build-id")).getBuildId();
}

describe("getBuildId", () => {
  it("reads Next's BUILD_ID file", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "build-id-"));
    mkdirSync(path.join(dir, ".next"));
    writeFileSync(path.join(dir, ".next", "BUILD_ID"), "abc123\n");
    expect(await buildIdIn(dir)).toBe("abc123");
  });

  it("falls back to the version without a production build", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "v1.2.3");
    const dir = mkdtempSync(path.join(tmpdir(), "build-id-"));
    expect(await buildIdIn(dir)).toBe("v1.2.3");
  });
});
