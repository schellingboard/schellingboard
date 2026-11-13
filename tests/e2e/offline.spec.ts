import { adminLogin } from "./helpers/admin";
import { login } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";

// Going offline is the one thing a script does that a person does with a
// tunnel or a flight mode. Everything before it is what the attendee did on
// the way: open the schedule, let the app settle in, open it again.
test("the schedule opens without a connection and says it may be out of date @014-US5", async ({
  page,
  context,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  await expect(
    page.getByRole("link", { name: /Opening Keynote/ })
  ).toBeVisible();

  // The worker keeps the app on the first visit; opening the schedule a
  // second time is what an attendee does, and it loads through the worker.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(
    page.getByRole("link", { name: /Opening Keynote/ })
  ).toBeVisible();
  await expect(page.getByText("Live", { exact: true })).toBeVisible();
  // The app saves the schedule a second after it shows; the attendee reads
  // it for a while, and nothing on the page says when the saving is done.
  // The cache write has no later signal; give the worker a moment to settle.
  await page.waitForTimeout(2000);

  await context.setOffline(true);
  await page.reload();

  await expect(
    page.getByRole("link", { name: /Opening Keynote/ })
  ).toBeVisible();
  await expect(
    page.getByText("Not updating: may be out of date")
  ).toBeVisible();
});

test("a schedule left open offers a reload after the server is upgraded @014-US5", async ({
  page,
  context,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  await expect(
    page.getByRole("link", { name: /Opening Keynote/ })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reload", exact: true })
  ).toBeHidden();

  // A test cannot upgrade the server it runs against, so the build the
  // server names is faked. The page learns of an upgrade when it next asks,
  // which a network coming back makes it do.
  await page.route("**/api/v1/health", async (route) => {
    const response = await route.fetch();
    const health = (await response.json()) as object;
    await route.fulfill({
      response,
      json: { ...health, buildId: "a-newer-build" },
    });
  });
  await context.setOffline(true);
  await context.setOffline(false);

  const reload = page.getByRole("button", { name: "Reload", exact: true });
  await expect(reload).toBeVisible();
  await page.unroute("**/api/v1/health");
  await reload.click();
  await expect(reload).toBeHidden();
  await expect(
    page.getByRole("link", { name: /Opening Keynote/ })
  ).toBeVisible();
});

// The admin pages are a chunk the shell does not name, as a translation will
// be. Their area needs the server, so the cache is what shows it is kept.
test("a chunk the app loaded later stays cached when the app is reloaded @014-US5", async ({
  page,
}) => {
  const cachedAssets = () =>
    page.evaluate(async () => {
      const cache = await caches.open("sb-spa-v1");
      return (await cache.keys())
        .map((request) => new URL(request.url).pathname)
        .filter((path) => path.startsWith("/_spa/assets/"));
    });

  await adminLogin(page);
  await expect(page.getByRole("heading", { name: "Events" })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(async () => (await cachedAssets()).length)
    .toBeGreaterThan(2);
  const before = await cachedAssets();

  await page.goto("/Conference-Gamma");
  await expect(
    page.getByRole("link", { name: /Opening Keynote/ })
  ).toBeVisible();
  // The worker prunes the cache after the page shows; nothing says when.
  await page.waitForTimeout(2000);

  expect(await cachedAssets()).toEqual(expect.arrayContaining(before));
});

test("a language the attendee has not used yet still opens offline @022-US1", async ({
  page,
  context,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  await expect(
    page.getByRole("link", { name: /Opening Keynote/ })
  ).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() =>
      page.evaluate(async () =>
        (await (await caches.open("sb-spa-v1")).keys()).some((request) =>
          request.url.includes("/_spa/assets/messages-")
        )
      )
    )
    .toBe(true);
  await page.waitForTimeout(2000);

  // The language was chosen on another device; this one never loaded it.
  await page.evaluate(() => localStorage.setItem("sb-locale", "de"));
  await context.setOffline(true);
  await page.reload();

  await expect(
    page.getByText("Wird nicht aktualisiert: möglicherweise veraltet")
  ).toBeVisible();
});
