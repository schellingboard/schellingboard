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
        "run, so it imports nothing but itself: no framework, no I/O, no npm package, not " +
        "even for a type. A schema belongs in `packages/contracts`; a type that only means " +
        "something to the database stays in `db/`. See docs/dev/adr/0010-workspace-packages.md.",
      from: { path: "^packages/domain/" },
      to: { pathNot: "^packages/domain/" },
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
      dot: { collapsePattern: "^(app|db|utils|tests)/[^/]+|^packages/[^/]+" },
    },
  },
};
