import { Hono, type Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { peopleUseCases, pageReads } from "@/server/composition";
import { actorOf } from "@/server/kernel/session-actor";
import {
  createGuestLogoutCookie,
  createLogoutCookie,
  isPasswordProtectionEnabled,
} from "@/utils/auth";
import { getBuildId } from "@/utils/build-id";
import { getImageRepositories, requestedWidth } from "@/utils/images";
import { readMapImage } from "@/utils/map-image";
import { serveSpaAsset, serveSpaShell, spaDir } from "@/utils/spa-files";
import { LIGHT_SURFACE } from "@/utils/theme";
import { api } from "./app";
import { adminApiRefusal, hasSiteCookie, siteApiRefusal } from "./gates";
import { problemResponse } from "./problem";

const MEDIA_CACHE_CONTROL = "private, max-age=31536000, immutable";
const PUBLIC_FILE_CACHE_CONTROL = "public, max-age=0, must-revalidate";
const PUBLIC_FILES = [
  "favicon.ico",
  "icon.svg",
  "apple-touch-icon.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "one-on-one.webp",
  "sw.js",
];

const underRoot = (pathname: string, root: string) =>
  pathname === root || pathname.startsWith(`${root}/`);

const publicDir = () => `${process.cwd()}/public`;

export const web = new Hono();

web.use("*", async (c, next) => {
  await next();
  const res = new Response(c.res.body, c.res);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  c.res = res;
});

web.get("/api/health", (c) => c.json({ status: "ok" }));

web.post("/api/auth/logout", async (c) => {
  const cookies = {
    get: (name: string) => {
      const value = getCookie(c, name);
      return value === undefined ? undefined : { value };
    },
  };
  const clear = ({
    name,
    value,
    ...options
  }: ReturnType<typeof createLogoutCookie>) =>
    setCookie(c, name, value, options);
  clear(createLogoutCookie());
  await peopleUseCases().signOut(await actorOf(cookies));
  clear(createGuestLogoutCookie());
  return c.body(null, 204);
});

web.all("/api/v1/*", async (c) => {
  const { pathname } = new URL(c.req.url);
  const refusal = underRoot(pathname, "/api/v1/admin")
    ? adminApiRefusal(c.req.raw)
    : await siteApiRefusal(c.req.raw);
  return refusal ? problemResponse(refusal) : api.fetch(c.req.raw);
});

const requireSiteCookie = async (c: Context) => {
  if (!isPasswordProtectionEnabled() || (await hasSiteCookie(c.req.raw)))
    return null;
  const url = new URL(c.req.url);
  const login = new URL("/login", url);
  login.searchParams.set("redirect", url.pathname + url.search);
  return c.redirect(login.toString(), 307);
};

// Answers 401 rather than redirecting: an <img> that follows a redirect to an
// HTML page renders a broken image either way.
web.use("/media/*", async (c, next) => {
  if (!isPasswordProtectionEnabled() || (await hasSiteCookie(c.req.raw)))
    return next();
  return c.text("Unauthorized", 401, { "cache-control": "no-store" });
});

const mediaResponse = (
  image: { data: Buffer; contentType: string } | null | undefined
): Response =>
  image
    ? new Response(new Uint8Array(image.data), {
        headers: {
          "content-type": image.contentType,
          "cache-control": MEDIA_CACHE_CONTROL,
        },
      })
    : new Response("Not Found", { status: 404 });

for (const kind of ["avatars", "locations"] as const) {
  web.get(`/media/${kind}/:filename`, async (c) => {
    const width = requestedWidth(new URL(c.req.url).searchParams);
    if (width === false) return c.text("Bad Request", 400);
    const repo = getImageRepositories()[kind];
    const { filename } = c.req.param();
    return mediaResponse(
      width === null
        ? await repo.read(filename)
        : await repo.readSized(filename, width)
    );
  });
}

web.get("/media/site/:filename", async (c) =>
  mediaResponse(await readMapImage(c.req.param("filename")))
);

web.get("/manifest.webmanifest", async (c) => {
  const settings = await pageReads().siteSettings();
  return c.body(
    JSON.stringify({
      name: settings.title,
      description: settings.description,
      // Pinned, so that changing start_url later doesn't read as a different
      // app and strand every install.
      id: "/",
      start_url: "/",
      display: "standalone",
      background_color: LIGHT_SURFACE,
      theme_color: LIGHT_SURFACE,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    }),
    200,
    { "content-type": "application/manifest+json", "cache-control": "no-store" }
  );
});

// Installing and push delivery fetch these without our cookie.
for (const file of PUBLIC_FILES)
  web.get(`/${file}`, () =>
    serveSpaAsset(publicDir(), [file], PUBLIC_FILE_CACHE_CONTROL)
  );
web.get("/locations/:file", (c) =>
  serveSpaAsset(
    publicDir(),
    ["locations", c.req.param("file")],
    PUBLIC_FILE_CACHE_CONTROL
  )
);
web.get("/_spa/*", (c) =>
  serveSpaAsset(spaDir(), c.req.path.slice("/_spa/".length).split("/"))
);

// Any other path is a page of the SPA. The admin pages and the site password
// screen get the shell without the cookie: the admin API holds the gate, and
// the screen is how a visitor gets past it.
web.all("*", async (c) => {
  const { pathname } = new URL(c.req.url);
  const open = underRoot(pathname, "/admin") || pathname === "/login";
  const refusal = open ? null : await requireSiteCookie(c);
  if (refusal) return refusal;
  const served = ["/api", "/media", "/legacy"].some((r) =>
    underRoot(pathname, r)
  );
  if (served || (c.req.method !== "GET" && c.req.method !== "HEAD"))
    return problemResponse({ status: 404, code: "route.notFound" });
  return serveSpaShell(spaDir(), getBuildId());
});
