import { readFileSync } from "fs";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (event: unknown) => void;

const source = readFileSync(path.join(process.cwd(), "public/sw.js"), "utf8");

const html = (body: string, init: ResponseInit = {}) =>
  new Response(body, {
    headers: { "content-type": "text/html" },
    ...init,
  });

function boot(network: (url: string, request?: Request) => Response) {
  const store = new Map<string, Map<string, Response>>();
  const listeners = new Map<string, Handler>();
  const key = (r: Request | string) =>
    typeof r === "string" ? r : new URL(r.url).pathname;
  const caches = {
    keys: () => Promise.resolve([...store.keys()]),
    delete: (name: string) => Promise.resolve(store.delete(name)),
    open: (name: string) => {
      const entries = store.get(name) ?? new Map<string, Response>();
      store.set(name, entries);
      return Promise.resolve({
        match: (r: Request | string) =>
          Promise.resolve(entries.get(key(r))?.clone()),
        put: (r: Request | string, response: Response) => {
          entries.set(key(r), response);
          return Promise.resolve();
        },
        keys: () =>
          Promise.resolve(
            [...entries.keys()].map((k) => ({ url: `http://x${k}` }))
          ),
        delete: (r: Request | string) =>
          Promise.resolve(entries.delete(key(r))),
      });
    },
  };
  let online = true;
  const fetchFn = (r: Request | string) => {
    if (!online) return Promise.reject(new TypeError("offline"));
    const url = typeof r === "string" ? new URL(r, "http://x") : new URL(r.url);
    return Promise.resolve(
      network(url.pathname, typeof r === "string" ? undefined : r)
    );
  };
  const self = {
    location: new URL("http://x/sw.js"),
    addEventListener: (type: string, fn: Handler) => listeners.set(type, fn),
    skipWaiting: vi.fn(() => Promise.resolve()),
    clients: { claim: vi.fn(() => Promise.resolve()) },
  };
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call -- the worker is a plain script, so running it is the only way to load it
  new Function("self", "caches", "fetch", source)(self, caches, fetchFn);

  const pending: Promise<unknown>[] = [];
  const dispatch = async (type: string, extra: object = {}) => {
    let answer: Promise<Response> | undefined;
    listeners.get(type)!({
      ...extra,
      waitUntil: (p: Promise<unknown>) => pending.push(p),
      respondWith: (p: Promise<Response>) => (answer = p),
    });
    const response = answer ? await answer : undefined;
    await Promise.all(pending.splice(0));
    return { answered: answer !== undefined, response };
  };
  const navigate = (pathname: string) =>
    dispatch("fetch", {
      request: { method: "GET", url: `http://x${pathname}`, mode: "navigate" },
    });
  return {
    store,
    dispatch,
    navigate,
    self,
    setOnline: (value: boolean) => (online = value),
  };
}

const shell = '<script src="/_spa/assets/index-1.js"></script>shell-1';
const site = (pathname: string) => {
  if (pathname === "/_spa/assets/index-1.js")
    return new Response("js", {
      headers: { "content-type": "text/javascript" },
    });
  if (pathname.startsWith("/api") || pathname.startsWith("/legacy"))
    return html("dynamic");
  return html(shell);
};

describe("the service worker", () => {
  let worker: ReturnType<typeof boot>;
  beforeEach(() => {
    worker = boot(site);
  });

  it("keeps the shell and its assets when installed", async () => {
    await worker.dispatch("install");

    const cache = [...worker.store.values()][0];
    expect([...cache.keys()].sort()).toEqual([
      "/_spa/assets/index-1.js",
      "/_spa/shell",
    ]);
    expect(worker.self.skipWaiting).toHaveBeenCalled();
  });

  it("forgets assets that a newer shell no longer names", async () => {
    let build = shell;
    const upgraded = boot((pathname) =>
      pathname.startsWith("/_spa/assets/") ? new Response("js") : html(build)
    );
    await upgraded.navigate("/Conference-Gamma");
    build = '<script src="/_spa/assets/index-2.js"></script>shell-2';

    await upgraded.navigate("/Conference-Gamma");

    const cache = [...upgraded.store.values()][0];
    expect([...cache.keys()].sort()).toEqual([
      "/_spa/assets/index-2.js",
      "/_spa/shell",
    ]);
  });

  it("serves the kept shell for a page of the SPA when the network is gone @014-US5", async () => {
    await worker.navigate("/Conference-Gamma");
    worker.setOnline(false);

    const { response } = await worker.navigate("/Conference-Gamma");

    expect(await response!.text()).toContain("shell-1");
  });

  it("prefers the network, so a new build shows as soon as it is there", async () => {
    let build = shell;
    const upgraded = boot(() => html(build));
    await upgraded.navigate("/Conference-Gamma");
    build = "shell-2";

    const { response } = await upgraded.navigate("/Conference-Gamma");

    expect(await response!.text()).toBe("shell-2");
  });

  it("serves a kept asset without asking the network", async () => {
    await worker.dispatch("install");
    worker.setOnline(false);

    const { response } = await worker.dispatch("fetch", {
      request: new Request("http://x/_spa/assets/index-1.js"),
    });

    expect(await response!.text()).toBe("js");
  });

  it("keeps a shell only from a real page, never a login redirect or an error", async () => {
    const redirected = Object.defineProperty(html("login"), "redirected", {
      value: true,
    });
    const gated = boot(() => redirected);
    await gated.navigate("/Conference-Gamma");
    const broken = boot(() => html("nope", { status: 500 }));
    await broken.navigate("/Conference-Gamma");

    const kept = (w: typeof gated) =>
      [...w.store.values()].reduce((n, cache) => n + cache.size, 0);
    expect(kept(gated)).toBe(0);
    expect(kept(broken)).toBe(0);
  });

  it.each([
    "/legacy/Conference-Gamma",
    "/api/v1/health",
    "/media/x",
    "/manifest.webmanifest",
  ])("leaves %s to the network", async (pathname) => {
    await worker.navigate("/Conference-Gamma");
    const { answered } = await worker.navigate(pathname);

    expect(answered).toBe(false);
  });

  it("leaves requests that are not navigations or assets alone", async () => {
    const { answered } = await worker.dispatch("fetch", {
      request: new Request("http://x/api/v1/health"),
    });
    const post = await worker.dispatch("fetch", {
      request: new Request("http://x/_spa/assets/index-1.js", {
        method: "POST",
      }),
    });

    expect(answered).toBe(false);
    expect(post.answered).toBe(false);
  });

  it("drops caches of other versions when it takes over", async () => {
    worker.store.set("sb-spa-v0", new Map());
    await worker.dispatch("activate");

    expect(worker.store.has("sb-spa-v0")).toBe(false);
    expect(worker.self.clients.claim).toHaveBeenCalled();
  });
});
