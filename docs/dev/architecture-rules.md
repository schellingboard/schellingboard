# Architecture rules

Conventions that only live in a document decay. These are the ones the build
checks, and where each kind belongs.

Two mechanisms, split by what they can see:

| Mechanism            | Sees                   | Good for                                      |
| -------------------- | ---------------------- | --------------------------------------------- |
| ESLint               | one file at a time     | banned calls, banned syntax, required shapes  |
| `dependency-cruiser` | the whole module graph | cycles, layer boundaries, "X may not reach Y" |

Run them with `make lint` and `make arch`; `make precommit` runs both.

## ESLint: rules about code inside a file

Most single-file rules need no plugin. `no-restricted-syntax` takes
[esquery](https://github.com/estools/esquery) selectors, so a rule is one
selector plus the sentence you want the author to read:

```js
{
  selector: "NewExpression[callee.name='Date'][arguments.length=0]",
  message: "`new Date()` reads an ambient clock. …",
}
```

Scope it with a config block listing the enforced areas in `files`. The
ambient-clock ban (ADR 0004) is the worked example: it covers `app/`, `db/`,
`emails/`, `packages/` and `utils/`.

Exempt a line, not a file, with `eslint-disable-next-line <rule> -- <reason>`.
A file-wide `ignores` entry would stop checking the other hundred lines too,
and an exemption is usually one call in an otherwise ordinary file. The `--`
reason is mandatory: it is what the next reader has instead of this page.

**Gotcha:** route-group and dynamic-segment paths need `**`. Flat config globs
are minimatch, which reads `[eventSlug]` as a character class, so a literal
`app/(site)/[eventSlug]/kiosk.tsx` silently matches nothing — and a `files`
entry that matches nothing looks exactly like one that works.

When a selector can't express the rule, write a local rule inline — flat config
takes a plugin object literally, so there is no package to publish and no build
step:

```js
const local = {
  rules: {
    "my-rule": {
      create(context) {
        /* … */
      },
    },
  },
};
export default tseslint.config({
  plugins: { local },
  rules: { "local/my-rule": "error" },
});
```

Because `projectService` is on, such rules get the TypeScript type checker, not
just the syntax tree.

## dependency-cruiser: rules about the module graph

ESLint reads one file at a time, so it cannot see a cycle or a layer violation
three hops out. `.dependency-cruiser.cjs` holds those. A rule is a `from` set,
a `to` set, and the reason:

```js
{
  name: "domain-stays-pure",
  severity: "error",
  comment: "why this edge is wrong, and what to do instead",
  from: { path: "^packages/domain/" },
  to: { pathNot: "^packages/domain/" },
}
```

`dependencyTypesNot: ["type-only"]` would narrow a rule to runtime edges only —
a useful escape valve mid-migration, when a shared type is still declared on the
wrong side of a boundary. One rule uses it, by decision: a use case may name the
`db/` container's repository types until its ports are its own
(`use-cases-take-only-container-types`, ADR 0012). Otherwise an import the
compiler erases still points the wrong way, and a boundary that holds only at
runtime is one nobody can reason about from the import list.

The direction that matters is inward. `db/` and `app/` are adapters and may
depend on the workspace packages; the packages may not depend on them
([ADR 0010](adr/0010-workspace-packages.md)). `packages/domain` imports nothing
but itself and `luxon`, and `packages/contracts` only `domain` and `zod`. Types
follow the same direction: an entity type is domain vocabulary and belongs in
`domain`, where both adapters can import it. A type that only means something
to the database — a row shape, a driver's handle — stays in `db/` and is used
only inside `db/`.

`db/repositories/` holds the repository ports and their SQLite adapters, and
nothing outside `db/` imports from it (`repositories-stay-in-db`); the rest of
the app reaches the repositories through `@/db/container`. A port's input or
page type stays next to the port while only `db/` uses it; once code outside
`db/` needs to name it, it is vocabulary and moves to `domain`.

`server/` follows [ADR 0012](adr/0012-http-api-v1.md): `server/kernel/` reaches
no module, no HTTP and no framework, not even through a helper it imports; a
module's `application/` imports no HTTP, framework or `db/` code; a module is
imported only through its `module.ts`, by other modules, tests and `app/` alike;
and `app/` reaches `server/` only through `module.ts`, the kernel and the API
mount.

`make arch-graph` renders the graph to `arch-graph.svg` (needs graphviz), which
is usually faster than arguing about where a boundary should go.

## Adding a rule

1. Write it, and **check that it fails** on a file that violates it — a
   mis-scoped rule reports success and enforces nothing.
2. Fix the violations it finds, or list them as exemptions with the reason.
   Prefer fixing: an exemption granted at introduction tends to be permanent.
3. Put the reason in the rule's `message`/`comment`, not only in a doc. The
   person who hits it is reading the error, not this page.
