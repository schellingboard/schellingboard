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
      "apps/web/src/ui/**/*.tsx",
      "apps/web/src/features/settings/email-settings-form.tsx",
      "apps/web/src/features/settings/language-setting.tsx",
      "apps/web/src/features/settings/settings-screen.tsx",
      "apps/web/src/features/notifications/*.tsx",
      "apps/web/src/features/events/*.tsx",
      "apps/web/src/app/error-boundary.tsx",
      "apps/web/src/app/event-page.tsx",
      "apps/web/src/app/footer.tsx",
      "apps/web/src/app/header-links.tsx",
      "apps/web/src/app/home-page.tsx",
      "apps/web/src/app/layout.tsx",
      "apps/web/src/app/map-button.tsx",
      "apps/web/src/app/nav-bar.tsx",
      "apps/web/src/app/not-found.tsx",
      "apps/web/src/app/page-notice.tsx",
      "apps/web/src/app/panel-host.tsx",
      "apps/web/src/app/reload-offer.tsx",
      "apps/web/src/app/sync-indicator.tsx",
      "apps/web/src/app/user-menu.tsx",
    ],
    ignores: ["**/*.test.{ts,tsx}"],
    plugins: { lingui },
    rules: {
      "lingui/no-unlocalized-strings": [
        "error",
        {
          ignoreFunctions: [
            "*.addEventListener",
            "*.removeEventListener",
            "*.setProperty",
            "*.removeProperty",
            "*.querySelector",
            "*.querySelectorAll",
            "*.matches",
            "*.getItem",
            "*.setItem",
            "*.removeItem",
            "*.getContext",
            "*.startsWith",
            "*.endsWith",
            "*.normalize",
            "*.execCommand",
            "*.setRangeText",
            "*.scrollIntoView",
            "*.getAttribute",
            "Event",
            "URL",
            "Error",
            "cx",
            "console.*",
          ],
          ignore: [
            // Glyphs, URL schemes, units and tag names
            "^(?:[A-Z]|ul|ol|px|[a-z]+:)$",
            "^https?://",
            // URL paths
            "^/[A-Za-z0-9/_.?=&-]*$",
            // CSS selectors
            ":not\\(",
            // Tailwind class lists: only lower-case tokens, one of them a utility with a known prefix
            "^(?=.*(?:^| )(?:[a-z]+:)*(?:bg|text|border|ring|rounded|h|w|min-w|max-w|p[xytblr]?|m[xytblr]?|gap|space-[xy]|focus|hover|disabled)-)[a-z0-9\\[\\]:/.%()#_!=,'-]+(?: [a-z0-9\\[\\]:/.%()#_!=,'-]+)*$",
            // Id suffixes such as `${id}-hint`
            "^-[a-z]+$",
            // SVG path data
            "^(?=.*\\d)[MmLlHhVvCcSsQqTtAaZz0-9\\s.,-]+$",
          ],
          ignoreNames: [
            "paginationFooter",
            "kind",
            "record",
            "timeZone",
            "day",
            "month",
            "year",
            { regex: { pattern: "className$", flags: "i" } },
            { regex: { pattern: "^[A-Z_]+$" } },
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
            "strokeWidth",
            "strokeLinecap",
            "strokeLinejoin",
            "points",
            "cx",
            "cy",
            "r",
            "x",
            "y",
            "x1",
            "x2",
            "y1",
            "y2",
            "width",
            "height",
            "transform",
            "textAnchor",
            "dominantBaseline",
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
