# Run progress

Next step: 2.

## Decisions

- Step 1: `@hono/zod-openapi` supports zod 4 (checked with `npm view` on 2026-10-04):
  1.6.3 peers on `zod ^4.0.0` and `hono >=4.10.0`, built on
  `@asteasolutions/zod-to-openapi` 9.1.0 (peer `zod ^4.0.0`). Repo zod is 4.6.5,
  hono 4.13.13. Contracts stay plain `zod`; no Hono dependency in `packages/contracts`.
- Step 1 (ADR 0012, Proposed): code under top-level `server/{kernel,http,composition.ts,
modules/<m>/{module.ts,ports.ts,application,http}}`; ports are Picks of the `db/`
  container's repositories (they stay in `db/`). Actor resolved from today's cookies
  (admin cookie, guest cookie + level) by one kernel function shared with server actions.
  Problem details: `type: about:blank`, `code` extension, contract failures `400
request.invalid` with `errors`. Idempotency: `idempotency_keys` keyed by actor + key,
  stores method/path/body hash/response; in-flight `409 idempotency.inProgress`, mismatch
  `422 idempotency.keyReused`, 5xx not stored, pruned after 24 h by the jobs loop;
  `command_key` on the change log deferred to step 4. `openapi.json` committed at
  `packages/contracts/openapi.json`; `make openapi` / `make openapi-check` (in precommit).
  Admin endpoints live under `/api/v1/admin/`, gated in `proxy.ts` like `/api/admin/*`
  (admin cookie only, no site password, cross-site check, 404 when disabled); the rest
  of `/api/v1` needs the site password. Proxy refusals there are problem details.

## Questions

## Log

- Step 1: ADR 0012 written (Proposed). `make precommit`: format, lint, arch, typecheck,
  test-coverage pass. Firefox E2E cannot run (Playwright CDN blocked by network policy);
  the suite is run on the preinstalled Chromium via an untracked local config instead.
  Docs-only step.
