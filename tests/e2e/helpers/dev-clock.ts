import { Page } from "@playwright/test";
import { expect } from "./fixtures";
import { DateTime } from "luxon";
import { login } from "./auth";

// Time travel for specs that need the app to think an event is running right
// now. It goes through the dev fake clock (?dev=1), not the browser clock:
// anything derived from "now" follows the app's simulated instant
// (server-seeded, cookie-driven — see docs/dev/adr/0004-dev-fake-clock.md),
// which a browser-only clock jump wouldn't move.

/**
 * 16:00 Berlin on Conference Gamma's first event day (seeded at today+14,
 * running 09:00–18:00 Europe/Berlin — see scripts/seed/seed-database.ts). Late
 * enough in the day that the now line starts outside the visible schedule
 * area, so only scrolling brings it into view.
 *
 * Specs using this must run in Europe/Berlin (`test.use({ timezoneId })`), so
 * the toolbar's datetime-local picker maps 16:00 to 16:00 Berlin.
 */
export const duringGammaDayOne = DateTime.now()
  .setZone("Europe/Berlin")
  .plus({ days: 14 })
  .set({ hour: 16, minute: 0, second: 0, millisecond: 0 });

/**
 * Move the dev fake clock to `target` via the toolbar's datetime picker, then
 * wait for the simulated date to show so the override cookie is committed.
 * The page must already carry `?dev=1`.
 */
export async function setDevClock(page: Page, target: DateTime) {
  await expect(page.getByText("Dev clock")).toBeVisible();
  const picker = page.getByLabel("Pick date and time");
  const value = target.toFormat("yyyy-MM-dd'T'HH:mm");
  // Filling in the value the picker already holds fires no change event, so
  // the toolbar applies nothing and there is no refresh to wait for below.
  // A test that lands on the same simulated moment twice hits exactly this —
  // the override cookie survives the user switch in between.
  if ((await picker.inputValue()) === value) return;
  // The legacy pages refresh in place (wait for that RSC response, or aborting
  // it fails the console guard); the SPA reloads instead. Whichever comes first.
  const moved = Promise.race([
    page
      .waitForResponse(
        (res) =>
          res.ok() &&
          res.request().headers()["rsc"] === "1" &&
          !res.request().headers()["next-router-prefetch"]
      )
      .then((res) => res.finished()),
    page.waitForEvent("load"),
  ]).catch(() => undefined);
  await picker.fill(value);
  // The toolbar prints the simulated instant in UTC; for the afternoon targets
  // these tests use, the calendar date is the same as Berlin's, so match on
  // the date alone.
  await expect(page.getByText(target.toFormat("yyyy-MM-dd"))).toBeVisible();
  await moved;
}

/**
 * Land the browser on `path` with the fake clock already inside Gamma's first
 * day, so anything keyed to "now" is present from first paint. The clock is
 * set first, then a reload replays the page with the override cookie in place
 * — a full navigation, so it can't abort an in-flight refresh.
 */
export async function openGammaScheduleDuringEvent(page: Page, path: string) {
  await login(page);
  const url = path.includes("?") ? `${path}&dev=1` : `${path}?dev=1`;
  await page.goto(url);
  await setDevClock(page, duringGammaDayOne);
  await page.reload();
}
