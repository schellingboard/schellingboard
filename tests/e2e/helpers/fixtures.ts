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
];

// Paths the server answers itself. Any other root path gets the SPA shell,
// which forwards to /legacy once it has loaded.
const SERVER_PATH =
  /^\/(legacy|api|media|locations|_next|_spa|sw\.js|manifest\.webmanifest|favicon\.ico|icon|apple-touch-icon|one-on-one)(\/|\.|-|$)/;

function isAllowed(text: string): boolean {
  return ALLOWED_CONSOLE_PATTERNS.some((re) => re.test(text));
}

function formatConsoleMessage(msg: ConsoleMessage): string {
  const loc = msg.location();
  const where = loc.url ? ` (${loc.url}:${loc.lineNumber})` : "";
  return `${msg.text()}${where}`;
}

export const test = base.extend<{ consoleGuard: void }>({
  // A person opening a link waits for the page it ends on, so goto does too:
  // the shell has loaded by then, but the page behind it has not.
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      let response = null;
      try {
        response = await goto(url, options);
      } catch (error) {
        if (!String(error).includes("interrupted by another navigation")) {
          throw error;
        }
      }
      if (!SERVER_PATH.test(new URL(page.url()).pathname)) {
        await expect
          .poll(() => new URL(page.url()).pathname, { timeout: 15_000 })
          .toMatch(/^\/legacy(\/|$)/);
        await page.waitForLoadState("load");
      }
      return response;
    };
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
