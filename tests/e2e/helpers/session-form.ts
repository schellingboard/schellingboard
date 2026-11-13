import { Page } from "@playwright/test";

/** Opens the searchable select with this label and picks the option whose text matches. */
export async function selectOption(
  page: Page,
  label: RegExp,
  option: string | RegExp
) {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: option }).first().click();
}

/** Opens the Start Time list and returns its option with this text. */
export async function openStartTimes(page: Page, name: string | RegExp) {
  const input = page.getByLabel(/^Start Time/);
  await input.click();
  const listId = await input.getAttribute("aria-controls");
  return page.locator(`[id="${listId}"]`).getByRole("option", { name });
}

export const dayRadios = (page: Page) =>
  page.getByRole("radio", {
    name: /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/,
  });
