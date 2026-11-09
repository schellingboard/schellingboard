import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const location = { replace: vi.fn(), reload: vi.fn() };

beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("location", location);
  location.replace.mockClear();
  location.reload.mockClear();
});
afterEach(() => vi.unstubAllGlobals());

describe("hard navigation", () => {
  it("leaves once: a later navigation or reload cannot abort the first", async () => {
    const { hardNavigate, hardReload } = await import("./hard-navigate");
    hardNavigate("/login");
    hardReload();
    hardNavigate("/elsewhere");
    expect(location.replace).toHaveBeenCalledExactlyOnceWith("/login");
    expect(location.reload).not.toHaveBeenCalled();
  });
});
