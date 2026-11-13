import path from "node:path";

import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

// Everything that is not a page of the SPA is answered by the server, in dev too.
const SERVER_PATHS = [
  "/api",
  "/media",
  "/locations",
  "/sw.js",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/one-on-one.webp",
];

// Names the translation chunks in the shell so the service worker caches them
// ahead of use: a language is then there offline after an upgrade too.
function localeChunks(): Plugin {
  let base = "/";
  return {
    name: "locale-chunks",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler(html, { bundle }) {
        const chunks = Object.values(bundle ?? {}).filter(
          (item) =>
            item.type === "chunk" && item.facadeModuleId?.endsWith(".po")
        );
        if (!chunks.length) return html;
        const names = chunks.map((chunk) => `${base}${chunk.fileName}`);
        return html.replace(
          "</head>",
          `<meta name="sb-locale-chunks" content="${names.join(" ")}" /></head>`
        );
      },
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    lingui({
      configPath: path.join(import.meta.dirname, "lingui.config.ts"),
      macroTransform: true,
    }),
    tailwindcss(),
    localeChunks(),
  ],
  base: command === "build" ? "/_spa/" : "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // A size budget, not a silencer: the admin pages are split off, the rest is
    // one bundle.
    chunkSizeWarningLimit: 700,
  },
  server: {
    port: Number(process.env.PORT ?? 3000),
    strictPort: true,
    proxy: Object.fromEntries(
      SERVER_PATHS.map((path) => [
        path,
        {
          target: process.env.API_ORIGIN ?? "http://localhost:3001",
          ws: true,
        },
      ])
    ),
  },
}));
