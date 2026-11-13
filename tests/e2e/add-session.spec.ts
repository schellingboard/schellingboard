import { login } from "./helpers/auth";
import { expect, test } from "./helpers/fixtures";
import { toast } from "./helpers/toast";
import { uniqueSuffix } from "./helpers/unique";
import { selectUser } from "./helpers/user";

test("a newly added session appears on the overview and can be opened @008-US1 @007-US5", async ({
  page,
}) => {
  await login(page);

  await page.goto("/Conference-Gamma");
  await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
  await selectUser(page, /Alice Test/i);

  // Reach the form the way a real user does: click a free "+" slot in the grid.
  // We don't care which slot, so take the first.
  await page.getByRole("link", { name: "Add session" }).first().click();
  await expect(
    page.getByRole("heading", { name: /Add a session/i })
  ).toBeVisible();

  // Unique per attempt: the DB is seeded once for the whole run, so a retry
  // would otherwise find the session its failed predecessor already created.
  const sessionTitle = `Yak shaving ${uniqueSuffix()}`;
  await page.getByRole("textbox").first().fill(sessionTitle);

  // A host is required to enable Submit; the selected user is prefilled as one.
  const submit = page.getByRole("button", { name: "Submit" });
  await expect(submit).toBeEnabled();
  await submit.click();

  // Lands straight back on the overview, with a confirmation toast. This is
  // the client-side navigation that previously served a stale (pre-mutation)
  // overview.
  await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
  await expect(toast(page)).toContainText(
    /Your session .* has been added successfully/i
  );

  // A save confirmation is routine, so it clears itself after ten seconds —
  // but not so soon that a reader who glanced away misses it.
  await page.waitForTimeout(3000);
  await expect(toast(page)).toBeVisible();
  await expect(toast(page)).toHaveCount(0, { timeout: 15_000 });

  // The new session must be visible WITHOUT reloading (see #253).
  const newSessionLink = page.getByRole("link", { name: sessionTitle });
  await expect(newSessionLink).toBeVisible();

  // Opening the new session exercises the event-layout session data used by
  // the details modal, not just the schedule card rendered from fresh props.
  await newSessionLink.click();
  const dialog = page.getByRole("dialog", { name: "Session details" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(sessionTitle, { exact: true })).toBeVisible();
});

test("the session form asks before discarding, and opens again from its address @008-US1", async ({
  page,
}) => {
  await login(page);
  await page.goto("/Conference-Gamma");
  await selectUser(page, /Alice Test/i);
  await page.getByRole("link", { name: "Add session" }).first().click();
  const form = page.getByRole("dialog", { name: "Session form" });
  await form.getByLabel("Session title").fill(`Unsaved ${uniqueSuffix()}`);

  await form.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Discard your changes?")).toBeVisible();
  await page.getByRole("button", { name: "Keep editing" }).click();
  await expect(form).toBeVisible();

  await page.reload();
  await expect(form.getByLabel("Session title")).toHaveValue("");
  await form.getByRole("button", { name: "Close" }).click();
  await expect(form).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Grid" })).toBeVisible();
});
