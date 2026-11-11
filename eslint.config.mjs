import lingui from "eslint-plugin-lingui";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

// "Now" enters at the request boundary and is passed down; reading an ambient
// clock deeper in silences the dev fake clock. See docs/dev/adr/0004-dev-fake-clock.md.
// Zero-argument forms only — `new Date(iso)` parses, it does not read a clock.
const noAmbientClock = [
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message:
      "`new Date()` reads an ambient clock. Take `now` from serverNow(), requestNow(req) or the replica's server clock and pass it down (ADR 0004).",
  },
  {
    selector:
      "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message:
      "`Date.now()` reads an ambient clock. Take `now` from serverNow(), requestNow(req) or the replica's server clock (ADR 0004). For elapsed time, use performance.now().",
  },
  {
    selector:
      "CallExpression[callee.object.name='DateTime'][callee.property.name=/^(now|local|utc)$/][arguments.length=0]",
    message:
      "Luxon's DateTime.now()/local()/utc() read an ambient clock. Use DateTime.fromJSDate(now) with the request's clock (ADR 0004).",
  },
];

export default tseslint.config(
  {
    // `site/` is the generated docs site (see docs/dev/documentation.md);
    // its JS comes from docmd, not from us. The Playwright output below is
    // likewise not ours — and the trace viewer bundle inside the html report
    // is big enough to run eslint out of heap, so an E2E run would otherwise
    // leave `make lint` crashing until the report is deleted.
    ignores: [
      ".dependency-cruiser.cjs",
      "apps/web/dist/**",
      "dist/**",
      "**/*.mjs",
      ".jj/**",
      "site/**",
      "dev-site/**",
      "coverage/**",
      "docs/dev/attendance-model/.venv/**",
      "playwright-report/**",
      "blob-report/**",
      "test-results/**",
      ".flake-hunt/**",
      ".e2e-docker/**",
      ".claude/worktrees/**",
    ],
  },
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    // Files whose user-facing strings are all in the catalog. Step 5 of #1328
    // adds one area at a time and ends with the whole of apps/web/src; see
    // docs/dev/i18n.md.
    files: [
      "apps/web/src/app/panel-landing.tsx",
      "apps/web/src/app/profile-walk.tsx",
      "apps/web/src/app/unread-count.tsx",
      "apps/web/src/features/people/person-cards.tsx",
      "apps/web/src/features/proposals/voting-buttons.tsx",
      "apps/web/src/features/schedule/agenda-view.tsx",
      "apps/web/src/features/schedule/location-col.tsx",
      "apps/web/src/features/schedule/positioned-block.tsx",
      "apps/web/src/ui/back-link.tsx",
      "apps/web/src/ui/brand-icons.tsx",
      "apps/web/src/ui/charts/legend.tsx",
      "apps/web/src/ui/inline-markdown.tsx",
      "apps/web/src/ui/location-placeholder.tsx",
      "apps/web/src/ui/password-manager-hint.tsx",
      "apps/web/src/ui/unavailable.tsx",
      "apps/web/src/ui/use-paging.tsx",
    ],
    plugins: { lingui },
    rules: {
      "lingui/no-unlocalized-strings": [
        "error",
        {
          ignoreNames: [
            "className",
            "type",
            "id",
            "key",
            "href",
            "role",
            "data-testid",
            "name",
            "variant",
            "size",
            "htmlFor",
            "to",
            "as",
            "d",
            "viewBox",
            "fill",
            "stroke",
          ],
        },
      ],
    },
  },
  {
    // The service worker ships to the browser as it is written. It is a
    // worker, not a window, so `self` has no lib the type-aware rules could
    // resolve it against — the project's tsconfig includes the file but never
    // checks it.
    files: ["public/sw.js"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { self: "readonly" },
    },
  },
  {
    files: ["db/repositories/sqlite/*.ts"],
    rules: {
      "@typescript-eslint/require-await": "off",
    },
  },
  {
    files: [
      "db/**/*.{ts,js}",
      "emails/**/*.{ts,tsx,js,jsx}",
      "packages/*/src/**/*.ts",
      "utils/**/*.{ts,js}",
    ],
    // Exemptions are per-line `eslint-disable-next-line no-restricted-syntax`
    // comments carrying their own reason, not file-wide ignores here: a file
    // that legitimately reads the real clock once still has every other line
    // checked. Two kinds survive — the fake clock itself and the pieces that
    // turn real time into effective time, and reads that are real-time by
    // design per ADR 0004 (auth cookie age, login and email throttles,
    // cache-busting `?v=` stamps). Elapsed time uses performance.now().
    rules: {
      "no-restricted-syntax": ["error", ...noAmbientClock],
    },
  }
);
