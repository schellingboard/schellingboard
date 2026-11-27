import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { ProxySignIn } from "@schellingboard/domain/proxy-sign-in";
import Database from "better-sqlite3";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { getRepositories } from "@/db/container";
import { resolveDbPath } from "@/db/migrate";
import { handleRequest } from "@/server/http/handler";
import { hashProxySecret } from "@/server/kernel/proxy-sign-in";

import { resetTestDb, setupTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import {
  GUEST_COOKIE_NAME,
  openGuestValue,
  verifiedGuestValue,
} from "../helpers/guest-cookie";

const EMAIL = "ada@proxy.example";
const SECRET_HEADER = "x-schellingboard-proxy-secret";

const on: ProxySignIn = {
  enabled: true,
  headerName: "X-Forwarded-Email",
  addresses: [],
  logoutUrl: "",
  siteAdmins: false,
};

// The pages need a shell to serve, and CI tests without building the web app.
const dist = vi.hoisted(() => ({ dir: "" }));
vi.mock("@/utils/spa-files", async (original) => ({
  ...(await original<typeof import("@/utils/spa-files")>()),
  spaDir: () => dist.dir,
}));

const configure = (patch: Partial<ProxySignIn> = {}) =>
  getRepositories().settings.updateProxySignIn({ ...on, ...patch });

function request(
  path: string,
  headers: Record<string, string> = {},
  { peer = "10.0.0.5", method = "GET" } = {}
) {
  return Promise.resolve(
    handleRequest(new Request(`http://test${path}`, { method, headers }), {
      incoming: { socket: { remoteAddress: peer } },
    })
  );
}

const whoAmI = async (
  headers: Record<string, string>,
  opts?: { peer?: string }
) => {
  const res = await request("/api/v1/me/identity", headers, opts);
  return ((await res.json()) as { guestId?: string }).guestId ?? null;
};

function sessionRows(): number {
  const db = new Database(resolveDbPath());
  try {
    return (
      db.prepare("SELECT count(*) AS n FROM login_sessions").get() as {
        n: number;
      }
    ).n;
  } finally {
    db.close();
  }
}

async function adminGuest(email = EMAIL) {
  const guest = await createGuest({ email });
  await getRepositories().guests.setSiteAdmin(guest.id, true);
  return guest;
}

beforeAll(async () => {
  setupTestDb();
  dist.dir = await fs.mkdtemp(path.join(os.tmpdir(), "spa-dist-"));
  await fs.writeFile(path.join(dist.dir, "index.html"), "<html></html>");
});
beforeEach(() => resetTestDb());
afterEach(() => vi.unstubAllEnvs());

describe("sign-in through a proxy", { tags: ["025-US2"] }, () => {
  it("acts as the person whose email the header carries, in any case", async () => {
    const ada = await createGuest({ email: EMAIL });
    await configure();

    expect(await whoAmI({ "X-Forwarded-Email": EMAIL })).toBe(ada.id);
    expect(await whoAmI({ "x-forwarded-email": EMAIL.toUpperCase() })).toBe(
      ada.id
    );
  });

  it("makes no session row and sets no cookie", async () => {
    await createGuest({ email: EMAIL });
    await configure();

    const res = await request("/api/v1/me/identity", {
      "X-Forwarded-Email": EMAIL,
    });

    expect(res.headers.get("set-cookie")).toBeNull();
    expect(sessionRows()).toBe(0);
  });

  it("ignores the header while it is off, and a stranger's email", async () => {
    await createGuest({ email: EMAIL });

    expect(await whoAmI({ "X-Forwarded-Email": EMAIL })).toBeNull();
    await configure();
    expect(
      await whoAmI({ "X-Forwarded-Email": "nobody@x.example" })
    ).toBeNull();
    expect(await whoAmI({})).toBeNull();
  });

  it("follows an email change on the next request", async () => {
    const ada = await createGuest({ email: EMAIL });
    await configure();
    expect(await whoAmI({ "X-Forwarded-Email": EMAIL })).toBe(ada.id);

    await getRepositories().guests.update(ada.id, {
      name: ada.name,
      info: { email: "new@proxy.example" },
    });

    expect(await whoAmI({ "X-Forwarded-Email": EMAIL })).toBeNull();
    expect(await whoAmI({ "X-Forwarded-Email": "new@proxy.example" })).toBe(
      ada.id
    );
  });

  it("refuses a header from a request that did not come through the proxy", async () => {
    const ada = await createGuest({ email: EMAIL });
    const repos = getRepositories().settings;
    await configure();
    await repos.setProxySecretHash(hashProxySecret("s3cret"));

    const email = { "X-Forwarded-Email": EMAIL };
    expect(await whoAmI(email)).toBeNull();
    expect(await whoAmI({ ...email, [SECRET_HEADER]: "wrong" })).toBeNull();
    expect(await whoAmI({ ...email, [SECRET_HEADER]: "s3cret" })).toBe(ada.id);
  });

  it("checks the socket address, also when it is IPv4-mapped", async () => {
    const ada = await createGuest({ email: EMAIL });
    await configure({ addresses: ["10.0.0.0/24", "2001:db8::/32"] });
    const email = { "X-Forwarded-Email": EMAIL };

    expect(await whoAmI(email, { peer: "10.0.0.9" })).toBe(ada.id);
    expect(await whoAmI(email, { peer: "::ffff:10.0.0.9" })).toBe(ada.id);
    expect(await whoAmI(email, { peer: "2001:db8::1" })).toBe(ada.id);
    expect(await whoAmI(email, { peer: "10.0.1.9" })).toBeNull();
    expect(await whoAmI(email, { peer: "::ffff:10.0.1.9" })).toBeNull();
  });

  it("requires every trust check that is set", async () => {
    const ada = await createGuest({ email: EMAIL });
    await configure({ addresses: ["10.0.0.5"] });
    await getRepositories().settings.setProxySecretHash(
      hashProxySecret("s3cret")
    );
    const headers = { "X-Forwarded-Email": EMAIL, [SECRET_HEADER]: "s3cret" };

    expect(await whoAmI(headers)).toBe(ada.id);
    expect(await whoAmI(headers, { peer: "10.0.0.6" })).toBeNull();
  });

  it("ignores the header on a cross-site request", async () => {
    await createGuest({ email: EMAIL });
    await configure();

    for (const cross of <Record<string, string>[]>[
      { origin: "http://evil.example" },
      { "sec-fetch-site": "cross-site" },
    ])
      expect(await whoAmI({ "X-Forwarded-Email": EMAIL, ...cross })).toBeNull();
  });

  it("keeps a cookie session of the same person, and ends one of another", async () => {
    const ada = await createGuest({ email: EMAIL });
    const bob = await createGuest();
    await configure();
    const email = { "X-Forwarded-Email": EMAIL };
    const asAda = `${GUEST_COOKIE_NAME}=${openGuestValue(ada.id)}`;

    expect(await whoAmI({ ...email, cookie: asAda })).toBe(ada.id);
    expect(sessionRows()).toBe(1);

    const asBob = `${GUEST_COOKIE_NAME}=${openGuestValue(bob.id)}`;
    expect(sessionRows()).toBe(2);
    expect(await whoAmI({ ...email, cookie: asBob })).toBe(ada.id);
    expect(sessionRows()).toBe(1);
    expect(await whoAmI({ cookie: asBob })).toBeNull();
  });

  it("signs out the cookie session it keeps", async () => {
    const ada = await createGuest({ email: EMAIL });
    await configure();
    const asAda = `${GUEST_COOKIE_NAME}=${openGuestValue(ada.id)}`;
    expect(sessionRows()).toBe(1);

    const res = await request(
      "/api/v1/auth/sign-out",
      {
        "X-Forwarded-Email": EMAIL,
        cookie: asAda,
        origin: "http://test",
        "sec-fetch-site": "same-origin",
        "idempotency-key": "k1",
      },
      { method: "POST" }
    );

    expect(res.status).toBe(204);
    expect(sessionRows()).toBe(0);
  });

  it("leaves the site-admin role to a password session, unless the setting gives it", async () => {
    const ada = await adminGuest();
    await configure();
    const email = { "X-Forwarded-Email": EMAIL };
    const admin = (headers: Record<string, string>) =>
      request("/api/v1/admin/guests", headers).then((r) => r.status);

    expect(await admin(email)).toBe(403);
    const password = `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(ada.id)}`;
    expect(await admin({ ...email, cookie: password })).toBe(200);

    await configure({ siteAdmins: true });
    expect(await admin(email)).toBe(200);
  });

  it("passes the site password for a signed-in person only", async () => {
    vi.stubEnv("SITE_PASSWORD", "site-pw");
    vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
    await createGuest({ email: EMAIL });
    await configure();
    const email = { "X-Forwarded-Email": EMAIL };

    expect((await request("/api/v1/me/identity")).status).toBe(401);
    expect((await request("/api/v1/me/identity", email)).status).toBe(200);
    expect((await request("/", email)).status).toBe(200);
    expect(
      (await request("/api/v1/me/identity", { "X-Forwarded-Email": "x@y.z" }))
        .status
    ).toBe(401);
  });

  it("also passes the site password on a page opened from a link elsewhere, and for media", async () => {
    vi.stubEnv("SITE_PASSWORD", "site-pw");
    vi.stubEnv("AUTH_SECRET", "0123456789abcdef0123456789abcdef");
    await createGuest({ email: EMAIL });
    await configure();
    const email = { "X-Forwarded-Email": EMAIL };

    const linked = { ...email, "sec-fetch-site": "cross-site" };
    expect((await request("/", linked)).status).toBe(200);
    expect((await request("/media/site/none.png", email)).status).not.toBe(401);
    expect((await request("/media/site/none.png")).status).toBe(401);
    expect(
      (await request("/", { "sec-fetch-site": "cross-site" })).status
    ).toBe(307);
  });

  it("does not let the person pick another name", async () => {
    await createGuest({ email: EMAIL });
    const other = await createGuest();
    await configure();

    const res = await handleRequest(
      new Request("http://test/api/v1/me/identity", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "X-Forwarded-Email": EMAIL,
        },
        body: JSON.stringify({ guestId: other.id }),
      }),
      { incoming: { socket: { remoteAddress: "10.0.0.5" } } }
    );

    expect(res.status).toBe(403);
    expect(((await res.json()) as { code: string }).code).toBe(
      "identity.fixed"
    );
  });
});

describe("the identity the web app reads", { tags: ["025-US2"] }, () => {
  const identity = async (headers: Record<string, string>) =>
    (await (await request("/api/v1/me/identity", headers)).json()) as {
      guestId: string | null;
      fixedBy?: { logoutUrl: string; siteAdmin: boolean };
    };

  it("says a proxy fixes the identity, with the logout address", async () => {
    await createGuest({ email: EMAIL });
    await configure({ logoutUrl: "https://sso.example/logout" });

    expect((await identity({ "X-Forwarded-Email": EMAIL })).fixedBy).toEqual({
      logoutUrl: "https://sso.example/logout",
      siteAdmin: false,
    });
  });

  it("says a site admin is one even when the proxy does not give the role", async () => {
    await adminGuest();
    await configure({ siteAdmins: false });

    expect((await identity({ "X-Forwarded-Email": EMAIL })).fixedBy).toEqual({
      logoutUrl: "",
      siteAdmin: true,
    });
  });

  it("says nothing of a proxy for a request without the header", async () => {
    await createGuest({ email: EMAIL });
    await configure();

    expect((await identity({})).fixedBy).toBeUndefined();
  });
});

describe("the proxy sign-in settings", { tags: ["025-US1"] }, () => {
  let adminCookie = "";
  beforeEach(async () => {
    const guest = await adminGuest("admin@x.example");
    adminCookie = `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(guest.id)}`;
  });
  const call = async (
    method: string,
    path: string,
    body?: unknown,
    headers: Record<string, string> = {}
  ) =>
    handleRequest(
      new Request(`http://test/api/v1/admin/proxy-sign-in${path}`, {
        method,
        headers: {
          "content-type": "application/json",
          cookie: adminCookie,
          ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      { incoming: { socket: { remoteAddress: "10.0.0.5" } } }
    );

  it("refuses a header that carries something else, and a bad address", async () => {
    for (const headerName of [
      "Cookie",
      "authorization",
      "X-Schellingboard-Proxy-Secret",
      "bad name",
    ]) {
      const res = await call("PUT", "", { ...on, headerName });
      expect(res.status).toBe(400);
    }
    for (const patch of [
      { addresses: ["10.0.0.0/33"] },
      { addresses: ["::ffff:10.0.0.0/104"] },
      { logoutUrl: "javascript:alert(1)" },
    ])
      expect((await call("PUT", "", { ...on, ...patch })).status).toBe(400);
  });

  it("saves the options and keeps the secret out of every read", async () => {
    const saved = await call("PUT", "", {
      ...on,
      addresses: ["10.0.0.0/24"],
      logoutUrl: "https://sso.example/logout",
    });
    expect(saved.status).toBe(200);

    const made = (await (await call("POST", "/secret")).json()) as {
      secret: string;
    };
    expect(made.secret.length).toBeGreaterThanOrEqual(32);

    const read = await (await call("GET", "")).text();
    expect(read).not.toContain(made.secret);
    expect(JSON.parse(read)).toMatchObject({
      enabled: true,
      secretSet: true,
      addresses: ["10.0.0.0/24"],
      logoutUrl: "https://sso.example/logout",
    });
    expect(await getRepositories().settings.getProxySecretHash()).toBe(
      hashProxySecret(made.secret)
    );

    expect((await call("DELETE", "/secret")).status).toBe(204);
    expect(
      ((await (await call("GET", "")).json()) as { secretSet: boolean })
        .secretSet
    ).toBe(false);
  });

  it("tells the admin what their own request carried", async () => {
    await configure();
    const own = async (headers: Record<string, string>) =>
      (
        (await (await call("GET", "", undefined, headers)).json()) as {
          ownRequest: unknown;
        }
      ).ownRequest;

    expect(await own({})).toEqual({ headerSeen: false, trusted: true });
    expect(await own({ "X-Forwarded-Email": "x@y.z" })).toEqual({
      headerSeen: true,
      trusted: true,
    });
    await configure({ addresses: ["192.168.0.1"] });
    expect(await own({ "X-Forwarded-Email": "x@y.z" })).toEqual({
      headerSeen: true,
      trusted: false,
    });
    await configure({ enabled: false });
    expect(await own({})).toBeNull();
  });

  it("is for site admins only", async () => {
    const guest = await createGuest();
    const res = await handleRequest(
      new Request("http://test/api/v1/admin/proxy-sign-in", {
        headers: {
          cookie: `${GUEST_COOKIE_NAME}=${await verifiedGuestValue(guest.id)}`,
        },
      })
    );
    expect(res.status).toBe(403);
  });
});
