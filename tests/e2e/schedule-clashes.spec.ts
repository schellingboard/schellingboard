import { test, expect } from "./helpers/fixtures";
import { loginAndGoto } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import { filterChip, switchToView } from "./helpers/schedule";

// Zanele's accepted 1-on-1 with Rafael falls inside "API Design" (15:30 on
// Gamma's first day); she has no RSVP for it, so only a bookmark makes a clash.
test("the Clashes chip lists what overlaps in your schedule @007-US11", async ({
  page,
}) => {
  await loginAndGoto(page, "/Conference-Gamma");
  await switchToView(page, "Agenda");
  await selectUser(page, "Zanele Khumalo");

  await page
    .getByRole("link", { name: /API Design/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog", { name: "Session details" });
  await dialog.getByRole("button", { name: "Bookmark this session" }).click();
  await page.keyboard.press("Escape");

  await filterChip(page, "Clashes").click();
  await expect(page.getByRole("link", { name: /API Design/ })).toBeVisible();
  await expect(page.getByText(/Rafael Souza/)).toBeVisible();
  await expect(page.getByText(/match · Clashes/)).toBeVisible();
});
