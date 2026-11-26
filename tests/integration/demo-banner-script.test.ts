// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MARKUP, SCRIPT } from "@/server/demo/banner";

const NOW = new Date("2026-03-10T12:00:00Z");

async function open(nextResetAt: Date) {
  document.body.innerHTML = MARKUP;
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ msUntilReset: nextResetAt.getTime() - Date.now() }),
      })
    )
  );
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
  new Function(SCRIPT)();
  await vi.advanceTimersByTimeAsync(0);
  return document.querySelector<HTMLElement>("[data-countdown]")!;
}

describe("the demo banner's script", { tags: ["024-US1"] }, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("counts down to the next reset", async () => {
    const countdown = await open(new Date(NOW.getTime() + 5_025_000));

    expect(countdown.textContent).toBe("01:23:45");
    await vi.advanceTimersByTimeAsync(5000);
    expect(countdown.textContent).toBe("01:23:40");
  });

  it("stresses the countdown in the last half hour", async () => {
    const far = await open(new Date(NOW.getTime() + 31 * 60_000));
    expect(far.classList.contains("soon")).toBe(false);

    const near = await open(new Date(NOW.getTime() + 29 * 60_000));
    expect(near.classList.contains("soon")).toBe(true);
  });

  it("falls back to words when the status cannot be read", async () => {
    document.body.innerHTML = MARKUP;
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ ok: false, status: 500 }))
    );
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    new Function(SCRIPT)();
    await vi.advanceTimersByTimeAsync(0);

    expect(document.querySelector("[data-countdown]")!.textContent).toBe(
      "soon"
    );
  });

  it("reports how much of the window it covers, so the app can sit below it", async () => {
    const inset = () =>
      document.documentElement.style.getPropertyValue("--top-inset");
    const scrollTo = (y: number) => {
      vi.stubGlobal("scrollY", y);
      window.dispatchEvent(new Event("scroll"));
    };
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(
      function (this: HTMLElement) {
        if (this.id !== "demo-banner") return 0;
        return this.querySelector<HTMLElement>("[data-more]")!.hidden ? 24 : 40;
      }
    );
    scrollTo(0);
    await open(new Date(NOW.getTime() + 60_000));
    expect(inset()).toBe("40px");

    scrollTo(15);
    expect(inset()).toBe("25px");
    scrollTo(500);
    expect(inset()).toBe("0px");

    scrollTo(0);
    document.querySelector<HTMLButtonElement>("[data-close]")!.click();
    expect(inset()).toBe("24px");
  });

  it("shrinks to one line on later pages until it is asked back", async () => {
    const part = (selector: string) =>
      document.querySelector<HTMLElement>(selector)!;
    const details = () =>
      [...document.querySelectorAll<HTMLElement>("[data-more]")].map(
        (el) => el.hidden
      );
    const later = () => open(new Date(NOW.getTime() + 60_000));
    await later();
    expect(details().every((hidden) => !hidden)).toBe(true);
    expect(part("[data-open]").hidden).toBe(true);

    part("[data-close]").click();
    expect(part("#demo-banner").hidden).toBe(false);
    expect(details().every((hidden) => hidden)).toBe(true);
    expect(part("[data-close]").hidden).toBe(true);
    expect(part("[data-open]").hidden).toBe(false);

    await later();
    expect(details().every((hidden) => hidden)).toBe(true);

    const countdown = part("[data-countdown]");
    await vi.advanceTimersByTimeAsync(5000);
    expect(countdown.textContent).toBe("00:00:55");

    part("[data-open]").click();
    expect(details().every((hidden) => !hidden)).toBe(true);
    expect(part("[data-open]").hidden).toBe(true);

    await later();
    expect(details().every((hidden) => !hidden)).toBe(true);
  });
});
