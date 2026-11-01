import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Everything that is not a page of the SPA is answered by Next, in dev too.
const NEXT_PATHS = [
  "/legacy",
  "/api",
  "/media",
  "/locations",
  "/_next",
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

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === "build" ? "/_spa/" : "/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // A size budget, not a silencer: the SPA is one route, so it cannot be split
    // usefully yet.
    chunkSizeWarningLimit: 700,
  },
  server: {
    port: Number(process.env.PORT ?? 3000),
    strictPort: true,
    proxy: Object.fromEntries(
      NEXT_PATHS.map((path) => [
        path,
        {
          target: process.env.NEXT_ORIGIN ?? "http://localhost:3001",
          ws: true,
        },
      ])
    ),
  },
}));
