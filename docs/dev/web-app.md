# The web app (`apps/web`)

`apps/web` is the single-page app that is replacing the Next pages one screen
family at a time ([ADR 0015](adr/0015-spa-alongside-next.md)). It is a workspace
package built with Vite, React and TanStack Router, styled with Tailwind and the
colour tokens in `styles/tokens.css` (the Next pages import the same file).
[Client design](target-architecture/04-client.md) describes where it is going.

## How it reaches the browser

- The Next pages live under `/legacy`. Every other root path that is not `/api`,
  `/media`, `/locations`, `/sw.js`, an icon or the manifest is a page of the SPA.
- `proxy.ts` applies the site password to those paths, then rewrites them to
  `/api/spa/shell`, which reads `apps/web/dist/index.html` from disk on each
  request and answers `no-store`.
- Hashed files are requested as `/_spa/assets/…`. The proxy skips them; a rewrite in
  `next.config.js` hands them to `/api/spa/assets/…`, which serves them as
  immutable and answers 404 for anything missing, never the shell.
- Until a screen moves, the router's catch-all route replaces the location with
  `/legacy` + path + query, so the app behaves as before. A path already under
  `/legacy` is left alone.

The files are read relative to the working directory, so the same code serves
`next start`, and the Docker image, which copies `apps/web/dist` next to
`server.js`.

## Build and run

- `make build` and the E2E web server run `vite build apps/web` before `next build`;
  the Dockerfile does the same. Next serves what is in `apps/web/dist`, so rebuild
  the SPA after changing it when testing through Next.
- `make dev` runs Next on `PORT + 1` and Vite on `PORT` (default 3000). Open the
  Vite port: it serves the SPA with hot reload and proxies `/legacy`, `/api`,
  `/media` and the other Next paths to Next. The shell gate does not apply in dev.
  A bare `next dev` answers root pages with the shell (503 until the SPA is built):
  use `/legacy/...` URLs with it, as the screenshots script does.
- E2E specs call `page.goto` with root paths; the fixture sends them to `/legacy/...`
  so a click never lands before hydration. One spec covers the shell's forward.

## Layout and rules

`apps/web/src/` follows [the client layout](target-architecture/04-client.md#layout);
`app/` and `replica/` exist so far (the replica: store, `apply`, feed client, sync state, a server clock offset and IndexedDB persistence keyed by event and viewer, opened as `stale`). dependency-cruiser enforces that the package imports
`packages/domain`, `packages/contracts` and `packages/api-client` only (never `app/`,
`server/`, `utils/` or `next`), that nothing imports it, that `features/` never
imports `api-client`, and that it declares what it imports. See
[Architecture rules](architecture-rules.md).

## Tests

Unit tests sit next to the code (`*.test.ts(x)`) and run in the `web` Vitest project
under happy-dom as part of `make test`. Screens are covered by the E2E suite; there
are no component tests in a browser runner.
