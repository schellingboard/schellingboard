import lingui from "eslint-plugin-lingui";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
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
    plugins: { "simple-import-sort": simpleImportSort },
    rules: { "simple-import-sort/imports": "error" },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    // Every .tsx file of the web app; see docs/dev/i18n.md. The dev toolbar is
    // English on purpose: it only exists with SB_ENABLE_DEV_TOOLS.
    files: ["apps/web/src/**/*.tsx"],
    ignores: [
      "**/*.test.{ts,tsx}",
      "**/test-setup.tsx",
      "**/page-test-support.tsx",
      "apps/web/src/app/dev-toolbar.tsx",
    ],
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
            "*.closest",
            "openProtectionForm",
            "document.createElement",
            "*.querySelectorAll",
            "*.closest",
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
            "*.removeAttribute",
            "*.toggleAttribute",
            "*.toFormat",
            "navigator.wakeLock.request",
            "window.matchMedia",
            "params.get",
            "params.getAll",
            "updated.set",
            "updated.append",
            "updated.delete",
            "next.delete",
            "Event",
            "URL",
            "Error",
            "onAnswer",
            "formatOptionalTime",
            "formatEventDates",
            "setField",
            "calls.move",
            "column",
            "next.set",
            "*.replaceAll",
            "statsDownloadUrl",
            "scatter",
            "cx",
            "console.*",
            "Set",
            "*.searchParams.get",
            "rest.delete",
            "*.hasAttribute",
            "*.getElementById",
            "*.glob",
            "lazyRouteComponent",
            "sessionFormRoute",
            "adminChild",
          ],
          ignore: [
            // Glyphs, URL schemes, units and tag names
            "^(?:[A-Z]|ul|ol|px|[a-z]+:)$",
            "^https?://",
            // URL paths
            "^/[A-Za-z0-9/_.?=&-]*$",
            // DOM event names, cookie attributes and CSS transforms
            "^(?:pointerdown|wheel|touchstart|keydown)$",
            // Enum values of props and options
            "^(?:failure|info|centered|grid|smooth)$",
            "path=/; max-age=",
            // Intl and Luxon option values
            "^(?:long|short|narrow|numeric|2-digit)$",
            // Theme, time-format and push-state tokens (stored or compared, never shown). Global: a
            // UI string that is exactly one of these passes in every file, so translate such words by hand.
            "^(?:system|light|dark|auto|checking|needs-install|unsupported|blocked|on|off)$",
            "^\\(prefers-color-scheme: (?:light|dark)\\)$",
            "^translate\\(",
            // CSS selectors
            ":not\\(",
            // Tailwind class lists: only lower-case tokens, one of them a utility with a known prefix
            "^(?=.*(?:^| )(?:[a-z]+:)*(?:bg|text|border|ring|rounded|h|w|min-w|max-w|p[xytblr]?|m[xytblr]?|gap|space-[xy]|focus|hover|disabled)-)[a-z0-9\\[\\]:/.%()#_!=,'-]+(?: [a-z0-9\\[\\]:/.%()#_!=,'-]+)*$",
            // Day form field keys
            "^(?:start|end)(?:Bookings)?$",
            // Event phase field keys
            "^[a-z]+Phase(?:Start|End)$",
            // Query-string openers such as `?redirect=`
            "^\\?[a-z]+=$",
            // Figure heading id prefix
            "^stats-$",
            // Id suffixes such as `${id}-hint`
            "^-[a-z]+$",
            // Idempotency-key suffixes such as `${key}:update`
            "^:(?:update|create|image)$",
            // The slot match-id prefix and problem codes passed as arguments
            "^(?:slot-|guest\\.(?:protected|unselected))$",
            // Task ids of the "select who you are" refusal
            "^(?:editProfile|(?:create|edit)Proposal|(?:add|edit)Session|changeSettings|see(?:Notifications|Comments)|openMeetings)$",
            // SVG path data
            "^(?=.*\\d)[MmLlHhVvCcSsQqTtAaZz0-9\\s.,-]+$",
          ],
          ignoreNames: [
            "paginationFooter",
            "timeFormat",
            "key",
            "table",
            "labelKey",
            "valueKey",
            "countKey",
            "kind",
            "fieldNames",
            "direction",
            "column",
            "tone",
            "aria-hidden",
            "target",
            "rel",
            "record",
            "timeZone",
            "timezone",
            "autoComplete",
            "dateStyle",
            "method",
            "accept",
            "identityMode",
            "status",
            "transition",
            "headingId",
            "commentHref",
            "cookie",
            "day",
            "month",
            "year",
            { regex: { pattern: "className$", flags: "i" } },
            { regex: { pattern: "^[A-Z_]+$" } },
            "className",
            "path",
            "hash",
            "code",
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
