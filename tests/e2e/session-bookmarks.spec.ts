import { test, expect } from "./helpers/fixtures";
import { loginAndGoto } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import { filterChip, switchToView } from "./helpers/schedule";

// Charlie hosts the React session and has an RSVP for Open Source
// Sustainability in the seed; API Design is neither.
test("an attendee bookmarks a session and finds it again under My schedule @007-US9 @007-US3", async ({
  page,
}) => {
  await loginAndGoto(page, "/Conference-Gamma");
  await switchToView(page, "Agenda");
  await selectUser(page, "Charlie Test");

  await page.getByRole("link", { name: /API Design/ }).click();
  const dialog = page.getByRole("dialog", { name: "Session details" });
  await dialog.getByRole("button", { name: "Bookmark this session" }).click();
  await expect(
    dialog.getByRole("button", { name: "Remove bookmark" })
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("link", { name: /API Design/ }).getByRole("img", {
      name: "Bookmarked",
    })
  ).toBeVisible();

  await filterChip(page, "My schedule").click();
  await expect(page.getByRole("link", { name: /API Design/ })).toBeHidden();
  await filterChip(page, "Choose what My schedule shows").click();
  await page.getByRole("checkbox", { name: "Bookmarked" }).check();
  await expect(page.getByRole("link", { name: /API Design/ })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: /API Design/ })).toBeVisible();
});
