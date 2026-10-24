// @module-tag 007-US7
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { KioskController } from "./kiosk";
import { scrollNowLineIntoView } from "./now-line";

vi.mock("./now-line", () => ({ scrollNowLineIntoView: vi.fn() }));

describe("KioskController", () => {
  const scrollSpy = vi.mocked(scrollNowLineIntoView);

  beforeEach(() => {
    vi.useFakeTimers();
    scrollSpy.mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(navigator, "wakeLock");
  });

  it("leaves the display alone for a minute after someone touches it", () => {
    render(<KioskController nowIsOnSchedule />);
    act(() => {
      document.dispatchEvent(new Event("pointerdown"));
      vi.advanceTimersByTime(30 * 1000);
    });
    expect(scrollSpy).not.toHaveBeenCalled();
  });

  it("asks to keep the screen awake and lets go on unmount", async () => {
    const release = vi.fn().mockResolvedValue(undefined);
    const request = vi.fn().mockResolvedValue({ release });
    Object.defineProperty(navigator, "wakeLock", {
      value: { request },
      configurable: true,
    });
    const { unmount } = render(<KioskController nowIsOnSchedule={false} />);
    await act(async () => {});
    expect(request).toHaveBeenCalledWith("screen");
    unmount();
    expect(release).toHaveBeenCalled();
  });
});
