import { Browser, Page } from "@playwright/test";
import { test, expect } from "./helpers/fixtures";
import { switchToView } from "./helpers/schedule";
import { uniqueSuffix } from "./helpers/unique";
import { login } from "./helpers/auth";
import { selectUser } from "./helpers/user";
import { dayRadios, selectOption } from "./helpers/session-form";
import { dismissToast, toast } from "./helpers/toast";

// Alice works in `page`; a second context is another attendee's screen or the
// kiosk and is never reloaded. Slots in Workshop Room on the last day are unclaimed.

async function openSchedule(browser: Browser, path: string, user?: RegExp) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page);
  await page.goto(path);
  if (user) await selectUser(page, user);
  return { context, page };
}

async function addSession(page: Page, title: string, startTime: string) {
  await page.getByRole("link", { name: "Add session" }).first().click();
  await expect(
    page.getByRole("heading", { name: /Add a session/i })
  ).toBeVisible();
  await page.getByRole("textbox").first().fill(title);
  await dayRadios(page).last().check();
  await selectOption(page, /^Location/, /Workshop Room/);
  await selectOption(page, /^Start Time/, startTime);
  const submit = page.getByRole("button", { name: "Submit" });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole("link", { name: title })).toBeVisible();
  await dismissToast(page);
}

async function openEditForm(page: Page, title: string) {
  await page.getByRole("link", { name: title }).click();
  const dialog = page.getByRole("dialog", { name: "Session details" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("link", { name: "Edit" }).click();
  await expect(
    page.getByRole("heading", { name: /Edit session/i })
  ).toBeVisible();
}

async function deleteSession(page: Page) {
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(toast(page)).toContainText(
    /Your session .* has been deleted successfully/i
  );
  await dismissToast(page);
}

test("another attendee's screen follows a session being created, moved and deleted without a reload @007-US8", async ({
  page,
  browser,
}) => {
  test.slow();
  await login(page);
  await page.goto("/Conference-Gamma");
  await selectUser(page, /Alice Test/i);

  const bob = await openSchedule(browser, "/Conference-Gamma", /Bob Test/i);
  try {
    await switchToView(bob.page, "Agenda");
    const title = `E2E Live Session ${uniqueSuffix()}`;
    const link = (p: Page) => p.getByRole("link", { name: title });

    await addSession(page, title, "19:10");
    await expect(link(bob.page)).toBeVisible();
    await expect(
      bob.page.getByRole("region", { name: /19:10/ }).getByRole("link", {
        name: title,
      })
    ).toBeVisible();

    await openEditForm(page, title);
    await selectOption(page, /^Start Time/, "19:40");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(toast(page)).toContainText(
      /Your session .* has been updated successfully/i
    );
    await dismissToast(page);
    await expect(
      bob.page.getByRole("region", { name: /19:40/ }).getByRole("link", {
        name: title,
      })
    ).toBeVisible();
    await expect(
      bob.page.getByRole("region", { name: /19:10/ }).getByRole("link", {
        name: title,
      })
    ).toHaveCount(0);

    await openEditForm(page, title);
    await deleteSession(page);
    await expect(link(bob.page)).toHaveCount(0);
  } finally {
    await bob.context.close();
  }
});

test("a kiosk screen shows sessions as they are added and removed without a reload @007-US8 @007-US7", async ({
  page,
  browser,
}) => {
  test.slow();
  await login(page);
  await page.goto("/Conference-Gamma");
  await selectUser(page, /Alice Test/i);

  const kiosk = await openSchedule(browser, "/Conference-Gamma?kiosk=1");
  try {
    const title = `E2E Kiosk Session ${uniqueSuffix()}`;

    await addSession(page, title, "21:10");
    await expect(kiosk.page.getByRole("link", { name: title })).toBeVisible();

    await openEditForm(page, title);
    await deleteSession(page);
    await expect(kiosk.page.getByRole("link", { name: title })).toHaveCount(0);
  } finally {
    await kiosk.context.close();
  }
});
