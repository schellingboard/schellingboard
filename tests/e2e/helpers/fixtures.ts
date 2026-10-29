import { test as base, expect, ConsoleMessage } from "@playwright/test";

const ALLOWED_CONSOLE_PATTERNS: RegExp[] = [
  // Firefox quirk: when a test navigates while a font
  // woff2 request is still in flight, Firefox aborts the request and logs
  // a "downloadable font: download failed" error. Status 2152398850 is
  // 0x804B0002 = NS_BINDING_ABORTED ("the request was cancelled"), so it's
  // not a real download failure.
  /downloadable font: download failed.*status=2152398850/,
  // Firefox quirk: a hard navigation that starts while a server action's
  // response is still streaming aborts that stream, which Firefox reports
  // as an uncaught "TypeError: Error in input stream" (see the comment at
  // admin.spec.ts's event-rename test for the same issue). logoutAction's
  // caller deliberately hard-reloads right after the action resolves, so
  // this can happen there too.
  /Error in input stream/,
  // Same root cause as above, different wording: a hard reload can also
  // abort an in-flight background prefetch of another page's RSC payload,
  // which Next's client runtime reports as an uncaught "Error: Connection
  // closed" while reading that stream.
  /Error: Connection closed\./,
  // Firefox quirk: a reload or navigation that lands while the schedule's
  // change feed (an EventSource) is connecting is logged as a failed
  // connection, even though the page closes the stream as it leaves.
  /can.t establish a connection to the server at \S+\/api\/v1\/events\/[^/]+\/feed/,
  // Firefox quirk: a reload that cuts off a room photo mid-download (the dev
  // clock helper reloads right after the SPA has) is logged as a corrupt image.
  // The seeded photos are static files, so real damage would fail every run.
  /Image corrupt or truncated.*\/locations\/[\w-]+\.jpg/,
];

// Paths the server answers itself. Any other root path gets the SPA shell,
// which forwards to /legacy once it has loaded.
const SERVER_PATH =
  /^\/(legacy|api|media|locations|_next|_spa|sw\.js|manifest\.webmanifest|favicon\.ico|icon|apple-touch-icon|one-on-one)(\/|\.|-|$)/;

// Legacy pages directly under the root: `/login` is never an event. Kept in
// step with apps/web/src/app/legacy-pages.ts (tests/unit/spa-legacy-pages.test.ts).
const LEGACY_ROOT_PAGES = ["account-security", "admin", "auth", "login"];

// An event's own page, `/{slug}`, and its proposals screens, which the SPA serves.
// Its 1-on-1 modal is still the legacy schedule's, which the SPA hands the address to.
function isEventPage(url: string): boolean {
  const slug = /^\/([^/?#]+)(?:\/proposals(?:\/[^?#]*)?)?(?:[?#].*)?$/.exec(
    url
  )?.[1];
  return slug !== undefined && !LEGACY_ROOT_PAGES.includes(slug);
}

const isPeoplePage = (url: string) => /^\/guests(?:[/?#]|$)/.test(url);

const isAccountPage = (url: string) =>
  /^\/(?:settings|notifications)(?:[?#]|$)/.test(url);

function isAllowed(text: string): boolean {
  return ALLOWED_CONSOLE_PATTERNS.some((re) => re.test(text));
}

function formatConsoleMessage(msg: ConsoleMessage): string {
  const loc = msg.location();
  const where = loc.url ? ` (${loc.url}:${loc.lineNumber})` : "";
  return `${msg.text()}${where}`;
}

export const test = base.extend<{ consoleGuard: void }>({
  // Specs go to a legacy page directly: through the shell, a click can land
  // before the page behind it has hydrated. The hop has its own spec (@014-US4).
  // An event's schedule and the people, settings and notification screens are
  // the SPA's own, so they are opened as they are.
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = (url, options) =>
      goto(
        url.startsWith("/") &&
          !SERVER_PATH.test(url) &&
          !isEventPage(url) &&
          !isPeoplePage(url) &&
          !isAccountPage(url)
          ? `/legacy${url}`
          : url,
        options
      );
    await provide(page);
  },
  consoleGuard: [
    async ({ page }, use) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() !== "error") return;
        const text = formatConsoleMessage(msg);
        if (isAllowed(text)) return;
        consoleErrors.push(text);
      });

      page.on("pageerror", (err) => {
        const text = err.stack ?? err.message;
        if (isAllowed(text)) return;
        pageErrors.push(text);
      });

      await use();

      expect(consoleErrors, "browser console.error during test").toEqual([]);
      expect(pageErrors, "uncaught page errors during test").toEqual([]);
    },
    { auto: true }, // run for every test, even those that don't explicitly request `consoleGuard`
  ],
});

export { expect };
