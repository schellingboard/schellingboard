import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";
import { switchToView } from "./helpers/schedule";

const KEYNOTE = /Opening Keynote/;

test("hard-navigating to a session URL renders the modal without hydration errors @007-US5", async ({
  page,
}) => {
  await login(page);

  await page.goto("/Conference-Gamma");
  await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();

  await page.getByRole("link", { name: KEYNOTE }).first().click();
  await expect(
    page.getByRole("dialog", { name: "Session details" })
  ).toBeVisible();

  // Opening the modal starts fetches of its own (the RSVP counts, and Next's
  // prefetches of the links it renders). Let them finish before reloading: the
  // reload aborts whatever is still in flight, and Firefox reports an aborted
  // fetch as an uncaught "NetworkError when attempting to fetch resource" that
  // the console guard fails on. "networkidle" is discouraged in general, but a
  // quiet network is the condition wanted here, and fixed waits of 1s and 3s
  // in its place both flaked under parallel load.
  await page.waitForLoadState("networkidle");

  // Reload with viewSession now in the URL. This is the "paste link" /
  // "refresh while modal is open" scenario — the page is server-rendered
  // with viewSession in the URL and then hydrated on the client.
  await page.reload();

  // Modal should be visible. The consoleGuard fixture (auto) will fail the
  // test if hydration logged any console.error.
  await expect(
    page.getByRole("dialog", { name: "Session details" })
  ).toBeVisible();

  // Settle again so async hydration warnings have time to fire before the
  // console guard checks.
  await page.waitForLoadState("networkidle");
});

test("leaving a session modal whose RSVPs are still loading is quiet @007-US5", async ({
  page,
}) => {
  await login(page);

  // Hold the modal's first RSVP request, so the reload below is certain to
  // catch it in flight. That is where the browser kills the request; an
  // unhandled rejection there reaches the window as an uncaught "NetworkError
  // when attempting to fetch resource", which the console guard fails on. On a
  // real network it takes a slow server and an impatient visitor; here it is
  // every run.
  const { promise: firstRsvpsHeld, resolve: releaseFirstRsvps } =
    Promise.withResolvers<void>();
  let heldOne = false;
  await page.route("**/api/rsvps?session=*", async (route) => {
    if (!heldOne) {
      heldOne = true;
      await firstRsvpsHeld;
    }
    // The held one belongs to a page that is gone by now, and continuing it
    // fails; the request after the reload is served as usual.
    await route.continue().catch(() => undefined);
  });

  await page.goto("/Conference-Gamma");
  await page.getByRole("link", { name: KEYNOTE }).first().click();
  await expect(
    page.getByRole("dialog", { name: "Session details" })
  ).toBeVisible();

  await page.reload();
  releaseFirstRsvps();
  await expect(
    page.getByRole("dialog", { name: "Session details" })
  ).toBeVisible();

  await page.waitForLoadState("networkidle");

  // Nothing above fails if the route stops matching — the request is simply
  // never held, the reload no longer catches one in flight, and the test goes
  // green without exercising anything.
  expect(heldOne, "the modal's RSVP request was never intercepted").toBe(true);
});

test("a session held in several rooms names each of them @007-US5 @004-US4", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  // The agenda lists the session once; the grid has a block per room.
  await switchToView(page, "Agenda");
  await page.getByRole("link", { name: /Machine Learning Ethics/ }).click();

  const details = page.getByRole("dialog", { name: "Session details" });
  await expect(details.getByText("Main Hall")).toBeVisible();
  await expect(details.getByText("Auditorium")).toBeVisible();

  // The proposal it was scheduled from names them too.
  await details.getByRole("link", { name: "here" }).click();
  await expect(
    page.getByRole("link", { name: /in Main Hall, Auditorium$/ })
  ).toBeVisible();
});
