import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { createAuthCookie } from "@/utils/auth";
import { getRepositories } from "@/db/container";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { withForwardedProto } from "@/server/http/forwarded";
import { web } from "@/server/http/web";
import { throughWeb } from "../helpers/through-web";

const VALID_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars

const dist = vi.hoisted(() => ({ dir: "" }));
vi.mock("@/utils/spa-files", async (original) => ({
  ...(await original<typeof import("@/utils/spa-files")>()),
  spaDir: () => dist.dir,
}));

beforeAll(async () => {
  setupTestDb();
  dist.dir = await fs.mkdtemp(path.join(os.tmpdir(), "spa-dist-"));
  await fs.mkdir(path.join(dist.dir, "assets"));
  await fs.writeFile(
    path.join(dist.dir, "index.html"),
    "<html><head></head><body>shell</body></html>"
  );
  await fs.writeFile(path.join(dist.dir, "assets/app.js"), "export {};");
});
beforeEach(() => {
  resetTestDb();
  vi.stubEnv("SITE_PASSWORD", "site-pw");
  vi.stubEnv("AUTH_SECRET", VALID_SECRET);
});
afterEach(() => vi.unstubAllEnvs());

const isShell = async (res: Response) =>
  res.status === 200 && (await res.text()).includes("shell");

describe("web: /media auth", () => {
  it("forwards a request carrying the site cookie", async () => {
    const site = await createAuthCookie();
    const res = await throughWeb("/media/avatars/abc.webp", {}, [site]);
    expect(res.status).toBe(404);
  });

  it("answers 401 rather than redirecting an unauthenticated image request", async () => {
    const res = await throughWeb("/media/site/map.webp");
    expect(res.status).toBe(401);
    expect(res.headers.get("location")).toBeNull();
  });
});

describe("web: pages are the SPA's", () => {
  it("serves the shell for a page path, keeping the query, once logged in", async () => {
    const cookie = await createAuthCookie();
    for (const p of ["/", "/conf/proposals?viewProposal=p1"]) {
      const res = await throughWeb(p, {}, [cookie]);
      expect(await isShell(res), p).toBe(true);
      expect(res.headers.get("location"), p).toBeNull();
    }
  });

  it("answers HEAD for a page like GET", async () => {
    const res = await throughWeb("/conf", { method: "HEAD" }, [
      await createAuthCookie(),
    ]);
    expect(res.status).toBe(200);
  });

  it("asks for the site password before the shell, and returns to the same page", async () => {
    const res = await throughWeb("/conf?x=1");
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("redirect")).toBe("/conf?x=1");
  });

  it("serves the shell for the admin paths and the site password screen without the cookie", async () => {
    for (const p of ["/admin/events", "/login?redirect=%2Fconf"])
      expect(await isShell(await throughWeb(p)), p).toBe(true);
  });

  it("serves the shell to everyone when no site password is set", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("SITE_PASSWORD", "");
    expect(await isShell(await throughWeb("/conf"))).toBe(true);
  });

  it("lets a visitor without the cookie reach the site password route and the health routes", async () => {
    for (const p of ["/api/v1/health", "/api/health"])
      expect((await throughWeb(p)).status, p).toBe(200);
    expect((await throughWeb("/api/v1/auth/site")).status).not.toBe(401);
  });

  it("answers an unknown /api path with problem details, not the shell", async () => {
    const cookie = await createAuthCookie();
    const res = await throughWeb("/api/nothing", {}, [cookie]);
    expect(res.status).toBe(404);
  });

  it("keeps crafted paths on this origin", async () => {
    const cookie = await createAuthCookie();
    for (const p of ["//evil.com", "/\\evil.com", "/%2f%2fevil.com"]) {
      expect(await isShell(await throughWeb(p, {}, [cookie])), p).toBe(true);
      const res = await throughWeb(p);
      const location = new URL(res.headers.get("location")!, "http://test");
      expect(location.origin, p).toBe("http://test");
      expect(location.pathname, p).toBe("/login");
    }
  });

  it("denies framing and sniffing and trims the referrer on every response", async () => {
    for (const p of ["/api/health", "/media/site/x.webp", "/conf"]) {
      const res = await throughWeb(p);
      expect(res.headers.get("x-frame-options"), p).toBe("DENY");
      expect(res.headers.get("x-content-type-options"), p).toBe("nosniff");
      expect(res.headers.get("referrer-policy"), p).toBe(
        "strict-origin-when-cross-origin"
      );
    }
  });
});

// Installing the app and delivering push both fetch these without our cookie.
describe("web: public files", () => {
  it("serves the icons, service worker and room photos without the site cookie", async () => {
    for (const p of [
      "/favicon.ico",
      "/icon.svg",
      "/apple-touch-icon.png",
      "/icon-192.png",
      "/sw.js",
      "/one-on-one.webp",
      "/locations/loc-room-a.jpg",
    ])
      expect((await throughWeb(p)).status, p).toBe(200);
  });

  it("serves the SPA's hashed assets without the cookie, and never the shell for a missing one", async () => {
    const asset = await throughWeb("/_spa/assets/app.js");
    expect(asset.status).toBe(200);
    expect(asset.headers.get("content-type")).toMatch(/javascript/);
    expect((await throughWeb("/_spa/assets/none.js")).status).toBe(404);
    expect((await throughWeb("/_spa/index.html")).status).toBe(404);
  });

  it("gates a path merely ending in an image extension", async () => {
    for (const p of ["/secret.png", "/guests/leak.webp"])
      expect((await throughWeb(p)).status, p).toBe(307);
  });
});

describe("web: manifest", () => {
  it("names the app after the site title, so the installed icon says whose event it is", async () => {
    await getRepositories().settings.update({
      title: "Rationality Camp",
      description: "Three days in the woods",
    });
    const res = await throughWeb("/manifest.webmanifest");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      name: "Rationality Camp",
      description: "Three days in the woods",
    });
  });

  it("is installable: standalone, starting at the site root, with a maskable icon", async () => {
    const built = (await (
      await throughWeb("/manifest.webmanifest")
    ).json()) as {
      name: string;
      display: string;
      start_url: string;
      id: string;
      icons: { sizes: string; purpose?: string }[];
    };
    expect(built.name).toBe("Example Conference Weekend");
    expect([built.display, built.start_url, built.id]).toEqual([
      "standalone",
      "/",
      "/",
    ]);
    expect(built.icons.map((i) => i.sizes)).toEqual(
      expect.arrayContaining(["192x192", "512x512"])
    );
    expect(built.icons.some((i) => i.purpose === "maskable")).toBe(true);
  });
});

describe("web: DELETE /api/v1/auth/site", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("opens without the site cookie, so a visitor can always leave", async () => {
    vi.stubEnv("SITE_PASSWORD", "site-pw");
    vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");

    const res = await throughWeb("/api/v1/auth/site", { method: "DELETE" });

    expect(res.status).toBe(204);
  });

  it("refuses a cross-site request", async () => {
    const res = await throughWeb("/api/v1/auth/site", {
      method: "DELETE",
      headers: { origin: "https://evil.example" },
    });

    expect(res.status).toBe(403);
  });
});

describe("web: behind a TLS-ending proxy", () => {
  const signIn = async (forwarded: boolean) => {
    const req = new Request("http://test/api/v1/auth/login", {
      method: "POST",
      headers: {
        origin: "https://test",
        "x-forwarded-proto": "https",
        cookie: `site-auth=${(await createAuthCookie()).value}`,
      },
    });
    return web.fetch(forwarded ? withForwardedProto(req) : req);
  };
  const codeOf = async (res: Response) =>
    ((await res.json().catch(() => ({}))) as { code?: string }).code;

  it("accepts a sign-in whose Origin is the https address the proxy serves", async () => {
    expect(await codeOf(await signIn(true))).not.toBe("request.crossSite");
  });

  it("refuses the same request when the scheme is not carried over", async () => {
    expect(await codeOf(await signIn(false))).toBe("request.crossSite");
  });
});
