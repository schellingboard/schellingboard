import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { serveSpaAsset, serveSpaShell } from "@/utils/spa-files";

let dir: string;

beforeAll(() => {
  const root = mkdtempSync(path.join(tmpdir(), "spa-"));
  dir = path.join(root, "dist");
  mkdirSync(dir);
  mkdirSync(path.join(dir, "assets"));
  writeFileSync(
    path.join(dir, "index.html"),
    "<!doctype html><head><title>x</title></head><p>shell"
  );
  writeFileSync(path.join(dir, "assets", "index-abc.js"), "console.log(1)");
  writeFileSync(path.join(dir, "assets", "index-abc.css"), "a{}");
  writeFileSync(path.join(root, "secret.txt"), "secret");
});

afterAll(() => {
  rmSync(path.dirname(dir), { recursive: true, force: true });
});

describe("the SPA shell", () => {
  it("is read from disk and never cached, so a new build shows at once", async () => {
    const res = await serveSpaShell(dir, "b1");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(await res.text()).toContain("shell");
  });

  it("names the build that served it, for the reload offer", async () => {
    const html = await (await serveSpaShell(dir, 'b"1')).text();
    expect(html).toContain('<meta name="sb-build" content="b&quot;1">');
    expect(html.indexOf("sb-build")).toBeLessThan(html.indexOf("</head>"));
  });

  it("answers 503 rather than an empty page when the app was not built", async () => {
    const res = await serveSpaShell(path.join(dir, "missing"), "b1");
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});

describe("the SPA assets", () => {
  it("are served with their type and cached for good", async () => {
    const js = await serveSpaAsset(dir, ["assets", "index-abc.js"]);
    expect(js.status).toBe(200);
    expect(js.headers.get("content-type")).toBe(
      "text/javascript; charset=utf-8"
    );
    expect(js.headers.get("cache-control")).toBe(
      "public, max-age=31536000, immutable"
    );
    const css = await serveSpaAsset(dir, ["assets", "index-abc.css"]);
    expect(css.headers.get("content-type")).toBe("text/css; charset=utf-8");
  });

  it("answer 404 for a missing file, never the shell", async () => {
    const res = await serveSpaAsset(dir, ["assets", "gone.js"]);
    expect(res.status).toBe(404);
    expect(await res.text()).not.toContain("shell");
  });

  it("answer 404 for a directory and for the shell file itself", async () => {
    expect((await serveSpaAsset(dir, ["assets"])).status).toBe(404);
    expect((await serveSpaAsset(dir, [])).status).toBe(404);
  });

  it("do not reach outside the build directory", async () => {
    for (const segments of [
      ["..", "secret.txt"],
      ["assets", "..", "..", "secret.txt"],
      ["assets", "..\\..\\secret.txt"],
      ["assets/../../secret.txt"],
    ]) {
      expect(
        (await serveSpaAsset(dir, segments)).status,
        segments.join("/")
      ).toBe(404);
    }
  });
});
