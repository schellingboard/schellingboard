import type { Page } from "@playwright/test";

import { login } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";
import { filterChip, switchToView } from "./helpers/schedule";
import { selectUser } from "./helpers/user";

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

test("a shared moment is drawn over the grid and its slots stay bookable @007-US15", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
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
});

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
