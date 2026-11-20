import { loginAndGoto } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";
import { filterChip, switchToView } from "./helpers/schedule";
import { selectUser } from "./helpers/user";

// Charlie hosts the React session and has an RSVP for Open Source
// Sustainability in the seed; API Design is neither.
test("an attendee hides a session, finds it under Hidden and shows it again @007-US10", async ({
  page,
}) => {
  await loginAndGoto(page, "/Conference-Gamma");
  await switchToView(page, "Agenda");
  await selectUser(page, "Charlie Test");
  await expect(filterChip(page, "Hidden")).toBeHidden();

  await page.getByRole("link", { name: /API Design/ }).click();
  const dialog = page.getByRole("dialog", { name: "Session details" });
  await dialog.getByRole("button", { name: "Hide on the schedule" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: /API Design/ })).toBeHidden();

  await filterChip(page, "Hidden").click();
  await expect(page.getByRole("link", { name: /API Design/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Open Source Sustainability/ })
  ).toBeHidden();

  await page.getByRole("link", { name: /API Design/ }).click();
  await dialog.getByRole("button", { name: "Show on the schedule" }).click();
  await page.keyboard.press("Escape");
  await filterChip(page, "Hidden").click();
  await expect(page.getByRole("link", { name: /API Design/ })).toBeVisible();
  await expect(filterChip(page, "Hidden")).toBeHidden();
});
