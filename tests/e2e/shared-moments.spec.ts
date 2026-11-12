import type { Locator } from "@playwright/test";
import { test, expect } from "./helpers/fixtures";
import { login } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import { filterChip, switchToView } from "./helpers/schedule";

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

  // Free slots under the band, found by where they are drawn: the click only
  // works if the stripes let it through.
  const links = await page.getByRole("link", { name: "Add session" }).all();
  let inside: Locator | undefined;
  for (const link of links) {
    const box = await link.boundingBox();
    if (box && box.y > band.y + 10 && box.y < band.y + 80) inside = link;
  }
  await inside!.click();
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
