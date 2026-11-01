/**
 * Architecture rules, checked by `make arch`. These are the constraints that
 * ESLint cannot see: ESLint looks at one file at a time, so it can ban a call
 * but not an edge in the module graph.
 *
 * See docs/dev/architecture-rules.md.
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "A cycle makes module init order significant and load-bearing, which breaks in ways " +
        "that depend on which file the bundler happens to enter first. Extract the shared " +
        "piece into a module both sides can depend on.",
      from: {},
      to: { circular: true },
    },
    {
      name: "domain-stays-pure",
      severity: "error",
      comment:
        "`packages/domain` is the vocabulary and the rules both the server and the browser " +
        "run, so it imports nothing but itself and luxon for time zones: no framework, no " +
        "I/O, no other npm package, not even for a type. A schema belongs in " +
        "`packages/contracts`; a type that only means something to the database stays in " +
        "`db/`. See docs/dev/adr/0010-workspace-packages.md.",
      from: { path: "^packages/domain/" },
      to: { pathNot: "^(packages/domain/|node_modules/luxon/)" },
    },
    {
      name: "contracts-import-only-domain-and-zod",
      severity: "error",
      comment:
        "`packages/contracts` describes what crosses the wire: zod schemas built on the " +
        "domain's types and constants. Anything else it reached for would ship to every " +
        "client that validates a form. See docs/dev/adr/0010-workspace-packages.md.",
      from: { path: "^packages/contracts/" },
      to: { pathNot: "^(packages/(contracts|domain)/|node_modules/zod/)" },
    },
    {
      name: "api-client-imports-only-openapi-fetch",
      severity: "error",
      comment:
        "`packages/api-client` is generated from `openapi.json` (`make openapi`) plus a " +
        "thin `openapi-fetch` wrapper. Its types come from the document, not from the " +
        "server's code or the contracts, so it describes only what goes over the wire.",
      from: { path: "^packages/api-client/" },
      to: { pathNot: "^(packages/api-client/|node_modules/openapi-fetch/)" },
    },
    {
      name: "packages-declare-their-dependencies",
      severity: "error",
      comment:
        "A workspace package may only import what its own package.json declares. Hoisting " +
        "lets the import resolve anyway, which is exactly why it has to be caught here.",
      from: { path: "^packages/" },
      to: { dependencyTypes: ["npm-no-pkg", "npm-unknown"] },
    },
    {
      name: "import-packages-by-name",
      severity: "error",
      comment:
        "Import a workspace package by its name (`@schellingboard/domain/guest`), never by " +
        "path (`@/packages/…`, `../packages/…`). A path import skips the package's manifest " +
        "and `exports`, so none of the package rules can see it. See ADR 0010.",
      from: { pathNot: "^packages/" },
      // dependency-cruiser reads `workspaces` from the importer's nearest manifest, so
      // inside apps/web (which has none) a by-name import is "undetermined", not aliased.
      to: {
        path: "^packages/",
        dependencyTypesNot: ["aliased-workspace", "undetermined"],
      },
    },
    {
      name: "packages-import-each-other-by-name",
      severity: "error",
      comment:
        "One workspace package imports another by name (`@schellingboard/domain/guest`), " +
        "never by a relative path into its `src/`. See ADR 0010.",
      from: { path: "^packages/([^/]+)/" },
      to: {
        path: "^packages/",
        pathNot: "^packages/$1/",
        dependencyTypesNot: ["aliased-workspace", "undetermined"],
      },
    },
    {
      name: "web-imports-only-shared-packages",
      severity: "error",
      comment:
        "`apps/web` is a static bundle that talks to the server over `/api/v1`. It may import " +
        "`packages/domain`, `packages/contracts` and `packages/api-client`, never " +
        "the server or the database. See ADR 0015 section 2.",
      // The test config reads the use-case catalogue to register its tags.
      from: { path: "^apps/web/", pathNot: "^apps/web/vitest\\.config\\.ts$" },
      to: {
        path: "^(server|utils|db|emails|tests|scripts)/|node_modules/(hono|@hono|better-sqlite3|drizzle-orm)/",
      },
    },
    {
      name: "nothing-imports-web",
      severity: "error",
      comment:
        "`apps/web` is an entry point: it is built and served, not imported. Shared code " +
        "belongs in a package. See ADR 0015 section 2.",
      from: { pathNot: "^apps/web/" },
      to: { path: "^apps/web/" },
    },
    {
      name: "features-never-call-the-api-client",
      severity: "error",
      comment:
        "Screens read the replica and call `commands/` or `queries/`; only those reach the " +
        "wire, so every request is predicted, keyed and reconciled in one place. See " +
        "docs/dev/target-architecture/04-client.md.",
      from: { path: "^apps/web/src/features/" },
      to: {
        path: "^packages/api-client/|node_modules/@schellingboard/api-client/",
      },
    },
    {
      name: "web-declares-its-dependencies",
      severity: "error",
      comment:
        "`apps/web` may only import what its own package.json declares; hoisting lets an " +
        "undeclared import resolve anyway.",
      from: { path: "^apps/web/" },
      to: { dependencyTypes: ["npm-no-pkg", "npm-unknown"] },
    },
    {
      name: "repositories-stay-in-db",
      severity: "error",
      comment:
        "`db/repositories/` holds the repository ports and their SQLite adapters, which " +
        "only `db/` wires up; everything else reaches them through `@/db/container`. An " +
        "entity type belongs in `packages/domain`, where both sides can import it, and so " +
        "does a port's input type once code outside `db/` names it (#965).",
      from: { pathNot: "^db/" },
      to: { path: "^db/repositories/" },
    },
    {
      name: "utils-does-not-read-repositories",
      severity: "error",
      comment:
        "The `utils/` helpers read through `pageReads()` or a use case, not the repository " +
        "container. The allow-list: the job loop, deliveries, notification and push " +
        "infrastructure, which are server plumbing, not reads.",
      from: {
        path: "^utils/",
        pathNot: ["^utils/jobs/", "^utils/(notifications|push)\\.ts$"],
      },
      to: { path: "^db/container\\.ts$", dependencyTypesNot: ["type-only"] },
    },
    {
      name: "kernel-reaches-no-module",
      severity: "error",
      comment:
        "The kernel is what every module builds on: Result, errors, Actor. It cannot know " +
        "about a module, the HTTP layer or a framework, not even through a helper it imports. " +
        "See ADR 0012.",
      from: { path: "^server/kernel/" },
      to: {
        path: "^(server/(modules|http)/|server/composition\\.ts$|node_modules/hono/|node_modules/@hono/)",
        reachable: true,
      },
    },
    {
      name: "use-cases-depend-on-ports",
      severity: "error",
      comment:
        "Use cases depend on ports; adapters are wired in composition.ts. `application/` " +
        "imports no HTTP, framework or `db/` code beyond the container's types. See ADR 0012.",
      from: { path: "^server/modules/[^/]+/application/" },
      to: {
        path: "^(server/http/|server/modules/[^/]+/http/|server/composition\\.ts$|db/|node_modules/(hono|@hono)/)",
        pathNot: "^db/container\\.ts$",
      },
    },
    {
      name: "use-cases-take-only-container-types",
      severity: "error",
      comment:
        "`application/` may name the container's repository types, never call the container: " +
        "repositories come in through the use case's dependencies. See ADR 0012.",
      from: { path: "^server/modules/[^/]+/application/" },
      to: { path: "^db/container\\.ts$", dependencyTypesNot: ["type-only"] },
    },
    {
      name: "modules-through-module-ts",
      severity: "error",
      comment:
        "Other modules' internals are private; call a use case through its `module.ts` or " +
        "react to a change. See ADR 0012.",
      from: { path: "^server/modules/([^/]+)/" },
      to: {
        path: "^server/modules/[^/]+/",
        pathNot: ["^server/modules/$1/", "^server/modules/[^/]+/module\\.ts$"],
      },
    },
    {
      name: "outside-reaches-modules-through-module-ts",
      severity: "error",
      comment:
        "A module is imported only through its `module.ts`, by tests too: what it does not " +
        "export is free to change. See ADR 0012.",
      from: { pathNot: "^server/modules/" },
      to: {
        path: "^server/modules/[^/]+/",
        pathNot: "^server/modules/[^/]+/module\\.ts$",
      },
    },
    {
      name: "feed-reads-through-module-queries",
      severity: "error",
      comment:
        "`server/feed/` loads no `db/` code, only the container's types: it gets the " +
        "repositories from `uow.read` and hands them to module queries. See ADR 0014.",
      from: { path: "^server/feed/" },
      to: { path: "^db/", dependencyTypesNot: ["type-only"] },
    },
    {
      name: "no-unresolvable",
      severity: "error",
      comment: "A dependency that does not resolve is a broken import.",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "no-deprecated-core",
      severity: "error",
      comment: "Deprecated Node core module; these get removed.",
      from: {},
      to: { dependencyTypes: ["core"], path: "^(punycode|domain|sys)$" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: {
      path: "(^|/)(coverage|site|playwright-report|test-results|apps/web/dist|dist/server)/",
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      mainFields: ["module", "main", "types", "typings"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "^(db|server|utils|tests)/[^/]+|^packages/[^/]+",
      },
    },
  },
};
