import {
  releaseNotes,
  SHOWN_RELEASES,
} from "@schellingboard/domain/release-notes";

import { login } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";

// What the notes actually say is the release notes' own business (see
// apps/web/src/app/release-highlights.test.ts); this is about the version in the footer
// being a way in to them at all.
test("the footer's version opens the recent release notes @014-US3", async ({
  page,
}) => {
  await login(page);
  await page.goto("/");

  await page.getByRole("button", { name: /what's new/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "What's new" })
  ).toBeVisible();

  // The last three entries: each release dated, so the reader can tell how old
  // this deployment is, and the release being prepared — when there is one —
  // named as unreleased instead.
  const shown = releaseNotes.slice(0, SHOWN_RELEASES);
  const headings = dialog.getByRole("heading", { level: 3 });
  await expect(headings).toHaveCount(SHOWN_RELEASES);
  for (const [index, heading] of (await headings.all()).entries()) {
    await expect(heading).toHaveText(
      shown[index].date ? /^\d+\.\d+\.\d+ — \d{1,2} \w+ \d{4}$/ : /^Unreleased$/
    );
  }
  await expect(dialog.getByRole("listitem").first()).not.toBeEmpty();

  await expect(
    dialog.getByRole("link", { name: /full changelog/i })
  ).toHaveAttribute(
    "href",
    "https://github.com/schellingboard/schellingboard/blob/main/CHANGELOG.md"
  );

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
