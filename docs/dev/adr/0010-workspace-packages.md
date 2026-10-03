# ADR 0010: Domain and contracts as workspace packages

- **Status:** Accepted
- **Date:** 2026-10-03
- **Issue:** #965

## Context

`model/` was meant to be the centre of the app: types, constants and validation
that both the pages and the database layer depend on, and that depend on neither.
Only a `dependency-cruiser` rule kept it that way, and it held half the picture.
The entity types still lived in `db/repositories/interfaces.ts` (#965), and
`model/` itself mixed two things: domain vocabulary (contact types, length caps,
the prompt pool) and the zod schemas for what forms and routes accept.

The [target architecture](../target-architecture/README.md) splits these into
`packages/domain` and `packages/contracts`, with workspace package manifests as the
boundary ([D5](../target-architecture/08-decisions.md#d5)). Its
[path from here](../target-architecture/10-path-from-here.md) makes that split the
first step, because it pays off even if nothing after it happens.

## Decision

The repository becomes a Bun workspace with two packages next to the Next app,
which stays at the root:

- **`@schellingboard/domain`** (`packages/domain`): entity types, domain constants
  and pure functions. It imports nothing but itself, not even an npm package.
- **`@schellingboard/contracts`** (`packages/contracts`): zod schemas for what
  crosses the wire. It imports `domain` and `zod`, nothing else.

Packages export their TypeScript source by subpath
(`@schellingboard/domain/guest`), with no build step: Turbopack, Vitest and `tsc`
compile workspace sources directly. There is no barrel file, so a client bundle
pulls in only the modules it names.

The boundary is checked three ways, because Bun hoists `node_modules` and an
undeclared import would otherwise still resolve:

- `make arch` (dependency-cruiser): `domain` reaches only itself, `contracts`
  only itself, `domain` and `zod`; a package is imported by name, never by a path
  into its `src/`; and every npm package a workspace package imports is declared
  in its own `package.json`.
- `make typecheck` compiles each package with its own `tsconfig.json`, which has
  no `@/` path alias and, for `domain`, no DOM or Node types.
- The ambient-clock lint rule (ADR 0004) covers `packages/*/src`.

Bun's isolated linker would make an undeclared import fail to resolve, which is
the enforcement the target design describes. It is not used: the Docker image
copies hoisted `node_modules/sharp` and `@img` by path, and Next's standalone
tracing has only ever been run against a hoisted tree. The rules above give the
same guarantee without changing how dependencies are laid out.

Tests stay in `tests/` for now. The repository ports stay in `db/` until the
target architecture's server modules exist to own them. That departs from #965,
which put the ports in `model/`; the boundary #965 was after is enforced instead
by a rule that nothing outside `db/` imports `db/repositories/`.

## Consequences

- `model/` is gone. A new rule goes in `domain`; a new form or route schema goes
  in `contracts`; if it needs a database type, it does not belong in either.
- An npm dependency for `domain` (a date library, say) is a decision: declare it
  in the package's `package.json` and widen the `domain-stays-pure` rule.
- The Docker build copies every package's `package.json` before
  `bun install --frozen-lockfile`. A new package needs a line there too.
- The root `tsconfig.json` still includes the packages, so the root `tsc` run
  checks them together with the app; editors and ESLint use each package's own
  `tsconfig.json`. These are not project references; those wait until the server
  and web app are packages too.
