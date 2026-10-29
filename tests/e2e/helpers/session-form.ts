import { Page } from "@playwright/test";

/** Picks the option whose text matches in the select with this label. */
export async function selectOption(
  page: Page,
  label: RegExp,
  option: string | RegExp
) {
  const select = page.getByLabel(label);
  const value = await select
    .getByRole("option", { name: option })
    .first()
    .getAttribute("value");
  await select.selectOption(value ?? "");
}

export const startTimeOption = (page: Page, name: string | RegExp) =>
  page.getByLabel(/^Start Time/).getByRole("option", { name });

export const dayRadios = (page: Page) =>
  page.getByRole("radio", {
    name: /Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/,
  });
