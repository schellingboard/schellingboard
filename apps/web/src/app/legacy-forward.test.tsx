import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { createAppRouter } from "./router";
import { hardNavigate } from "./hard-navigate";

vi.mock("./hard-navigate", () => ({ hardNavigate: vi.fn() }));

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

async function open(url: string) {
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [url] })
  );
  await router.load();
  const container = document.createElement("div");
  act(() => {
    createRoot(container).render(<RouterProvider router={router} />);
  });
}

describe("the catch-all route", () => {
  beforeEach(() => vi.mocked(hardNavigate).mockClear());
  afterEach(() => vi.clearAllMocks());

  it("sends a path the SPA does not own to /legacy, query kept", async () => {
    await open("/conf/kiosk?x=p1");
    expect(hardNavigate).toHaveBeenCalledExactlyOnceWith(
      "/legacy/conf/kiosk?x=p1"
    );
  });

  it("does not forward a path already under /legacy", async () => {
    await open("/legacy/conf");
    expect(hardNavigate).not.toHaveBeenCalled();
  });
});
