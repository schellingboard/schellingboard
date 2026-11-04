/*
 * SchellingBoard's service worker. It delivers push notifications (a browser
 * only hands them to a worker) and keeps the SPA openable offline: the shell
 * and its hashed assets are cached, and the shell answers SPA navigations when
 * the network does not. Nothing under /api is ever cached or
 * intercepted: the schedule's own copy on the device knows how stale it is,
 * and a schedule that keeps changing is worse than useless served stale.
 *
 * Served from the site root so its scope covers the whole app, and exempted
 * from the site password in server/http/web.ts (a 404 here takes notifications with it).
 */

const CACHE = "sb-spa-v1";
const SHELL_KEY = "/_spa/shell";
const ASSET_PATTERN = /\/_spa\/assets\/[^"'\s)]+/g;
const NOT_SPA_PAGES = ["/api", "/media", "/locations", "/_spa"];

const isSpaPage = (url) =>
  url.origin === self.location.origin &&
  !/\.[a-z0-9]+$/i.test(url.pathname) &&
  !NOT_SPA_PAGES.some(
    (root) => url.pathname === root || url.pathname.startsWith(root + "/")
  );

const isShell = (response) =>
  response.ok &&
  !response.redirected &&
  (response.headers.get("content-type") || "").includes("text/html");

async function keepShell(response) {
  const cache = await caches.open(CACHE);
  await cache.put(SHELL_KEY, response.clone());
  const assets = (await response.text()).match(ASSET_PATTERN) || [];
  const wanted = new Set(
    assets.map((asset) => new URL(asset, self.location.origin).href)
  );
  for (const request of await cache.keys()) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/_spa/assets/") && !wanted.has(request.url))
      await cache.delete(request);
  }
  await Promise.all(
    assets.map(async (asset) => {
      if (await cache.match(asset)) return;
      try {
        const fetched = await fetch(asset);
        if (fetched.ok) await cache.put(asset, fetched);
      } catch {
        // It is cached when the page asks for it.
      }
    })
  );
}

async function shellFor(request, event) {
  const kept = async () => (await caches.open(CACHE)).match(SHELL_KEY);
  let response;
  try {
    response = await fetch(request);
  } catch (error) {
    const offline = await kept();
    if (offline) return offline;
    throw error;
  }
  if (isShell(response)) event.waitUntil(keepShell(response.clone()));
  else if (response.status >= 500) return (await kept()) || response;
  return response;
}

async function asset(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const response = await fetch("/");
        if (isShell(response)) await keepShell(response);
      } catch {
        // The next navigation keeps the shell instead.
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys())
        if (name !== CACHE) await caches.delete(name);
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (request.mode === "navigate" && isSpaPage(url))
    event.respondWith(shellFor(request, event));
  else if (
    url.origin === self.location.origin &&
    url.pathname.startsWith("/_spa/assets/")
  )
    event.respondWith(asset(request));
});

self.addEventListener("push", (event) => {
  // iOS revokes the subscription of a worker that takes a push and shows
  // nothing, so every path through here ends in a visible notification —
  // including one where the payload is missing or unreadable.
  let notice = {};
  try {
    notice = event.data ? event.data.json() : {};
  } catch {
    notice = {};
  }

  event.waitUntil(
    self.registration.showNotification(notice.title || "SchellingBoard", {
      body: notice.body || "Something happened at your event.",
      icon: "/icon-192.png",
      data: { url: notice.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      // Reuse a window that is already on the site rather than opening a
      // second copy of the app beside the one the guest left open.
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        try {
          await client.focus();
          await client.navigate(url);
          return;
        } catch {
          // A window this worker doesn't control refuses to be navigated;
          // a new one is better than one left where it was.
        }
      }
      await self.clients.openWindow(url);
    })()
  );
});
