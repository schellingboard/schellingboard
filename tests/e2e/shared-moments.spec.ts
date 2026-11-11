import type { Page } from "@playwright/test";
import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import { adminLogin } from "./helpers/admin";
import { uniqueSuffix } from "./helpers/unique";
import { filterChip, switchToView } from "./helpers/schedule";

// Found by where the slots are drawn: the click only works if the stripes let
// it through. The click goes to the measured point, not to a re-found link, so
// a session added in parallel between the two cannot make it miss.
async function clickSlotUnder(page: Page, bandY: number) {
  const point = await page
    .getByRole("link", { name: "Add session" })
    .evaluateAll(
      (links, y) =>
        links
          .map((l) => l.getBoundingClientRect())
          .filter((r) => r.y > y + 10 && r.y < y + 80)
          .map((r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 }))[0],
      bandY
    );
  expect(point).toBeTruthy();
  await page.mouse.click(point.x, point.y);
}

test("the text view lists a shared moment among the sessions, even under My schedule @007-US15", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  await selectUser(page, /Alice Test/i);
  await switchToView(page, "Agenda");

  const row = page
    .getByRole("listitem")
    .filter({ hasText: "Opening keynote" })
    .filter({ hasText: "09:30–10:30" });
  await expect(row).toBeVisible();
  await expect(row.getByRole("link")).toHaveCount(0);

  await filterChip(page, "My schedule").click();
  await expect(row).toBeVisible();
});

test("a slot inside a shared moment stays bookable, with a notice @007-US15", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  await selectUser(page, /Alice Test/i);

  const pill = page.getByRole("button", {
    name: "Opening keynote · 09:30–10:30",
  });
  await expect(pill).toBeVisible();
  const band = (await pill.boundingBox())!;
  await clickSlotUnder(page, band.y);

  await expect(
    page.getByRole("heading", { name: /Add a session/i })
  ).toBeVisible();
  await expect(
    page.getByText("This slot is during Opening keynote (09:30 – 10:30)")
  ).toBeVisible();
  const title = `E2E Inside Keynote ${uniqueSuffix()}`;
  await page.getByLabel(/Session title/).fill(title);
  await page.getByRole("button", { name: "Submit" }).click();

  const saved = page.getByRole("link", { name: title });
  await expect(saved).toBeVisible();
  // The page may have scrolled back, so measure the band again.
  const after = (await pill.boundingBox())!;
  const box = (await saved.boundingBox())!;
  expect(box.y).toBeGreaterThan(after.y);
  expect(box.y).toBeLessThan(after.y + 90);
});

test("an organizer adds a shared moment to every day of an event @015-US9", async ({
  page,
}) => {
  await adminLogin(page);
  await page.goto("/admin/events");
  const eventName = `E2E Moments ${uniqueSuffix()}`;
  await page.getByRole("button", { name: "New event" }).click();
  await page.getByLabel("Name*").fill(eventName);
  await page.getByLabel("Identity").selectOption("open");
  await page.getByRole("button", { name: "Create event" }).click();
  await page
    .getByRole("listitem")
    .filter({ hasText: eventName })
    .getByRole("link", { name: "Manage" })
    .click();

  const days = page.getByRole("region", { name: "Days" });
  for (const date of ["2030-10-01", "2030-10-02"]) {
    await days.getByRole("button", { name: "Add day" }).click();
    await days.getByLabel("Start*").fill(`${date}T09:00`);
    await days.getByLabel("End*").fill(`${date}T18:00`);
    await days.getByLabel("Bookings open*").fill(`${date}T09:00`);
    await days.getByLabel("Bookings close*").fill(`${date}T17:30`);
    await days.getByRole("button", { name: "Add day" }).click();
  }
  await expect(days.getByRole("listitem")).toHaveCount(2);

  const moments = page.getByRole("region", { name: "Shared moments" });
  await moments.getByRole("button", { name: "Add shared moment" }).click();
  await moments.getByLabel("Title").fill("Lunch");
  await moments.getByLabel("Start").fill("12:30");
  await moments.getByLabel("End").fill("14:00");
  await moments.getByRole("button", { name: "Add moment" }).click();
  await expect(moments.getByRole("listitem")).toHaveCount(2);
  await expect(
    moments.getByRole("button", { name: /Edit Lunch on/ })
  ).toHaveCount(2);
});
