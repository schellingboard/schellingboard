import { defineConfig } from "@lingui/conf";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "de", "pseudo-LOCALE"],
  pseudoLocale: "pseudo-LOCALE",
  format: formatter({ lineNumbers: false }),
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
