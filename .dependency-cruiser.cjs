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
      to: { path: "^packages/", dependencyTypesNot: ["aliased-workspace"] },
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
      name: "persistence-does-not-reach-up",
      severity: "error",
      comment:
        "`db/` is a driven adapter. If it needs something from the web layer, the dependency " +
        "is pointing the wrong way — pass the value in instead.",
      from: { path: "^db/" },
      to: { path: "^app/" },
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
      name: "server-does-not-reach-into-app",
      severity: "error",
      comment:
        "`server/` holds the use cases and the API that outlive Next (step 7 of the target " +
        "architecture); `app/` is a client of it, never the other way round. See ADR 0012.",
      from: { path: "^server/" },
      to: { path: "^app/" },
    },
    {
      name: "app-reaches-server-through-module-ts",
      severity: "error",
      comment:
        "`app/` calls the server through a module's `module.ts`, the use cases wired in " +
        "`composition.ts`, the kernel's actor and Result, or the API mount; a module's " +
        "internals are private. See ADR 0012.",
      from: { path: "^app/" },
      to: {
        path: "^server/",
        pathNot: [
          "^server/modules/[^/]+/module\\.ts$",
          "^server/composition\\.ts$",
          "^server/kernel/",
          "^server/http/app\\.ts$",
        ],
      },
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
        path: "^(server/(modules|http)/|server/composition\\.ts$|app/|node_modules/(next|hono|@hono)/)",
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
        path: "^(server/http/|server/modules/[^/]+/http/|server/composition\\.ts$|db/|node_modules/(next|hono|@hono)/)",
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
      path: "(^|/)(\\.next|coverage|site|playwright-report|test-results)/",
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
        collapsePattern: "^(app|db|server|utils|tests)/[^/]+|^packages/[^/]+",
      },
    },
  },
};
