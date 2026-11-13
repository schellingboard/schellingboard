import { defineConfig } from "@lingui/conf";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "de", "pseudo-LOCALE"],
  pseudoLocale: "pseudo-LOCALE",
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}/messages",
      include: [
        "<rootDir>/src",
        "<rootDir>/../../emails",
        "<rootDir>/../../server",
        "<rootDir>/../../utils",
      ],
    },
  ],
});
