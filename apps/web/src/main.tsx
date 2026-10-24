import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { createAppRouter } from "./app/router";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={createAppRouter()} />
  </StrictMode>
);

// Hot reload exists only on the dev server, where a worker would hide edits.
if (!import.meta.hot && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
