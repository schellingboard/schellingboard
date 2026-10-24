import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { fakeApi } from "../commands/fake-api";
import { ReloadOffer, runningBuildId } from "./reload-offer";

let serverBuild = "b1";
let reachable = true;

function setup(props: { kiosk?: boolean; running?: string | null } = {}) {
  const onReload = vi.fn();
  const { api, calls } = fakeApi(() => {
    if (!reachable) throw new TypeError("offline");
    return Response.json({
      status: "ok",
      version: "4.0.0",
      buildId: serverBuild,
      devTools: false,
    });
  });
  render(
    <ReloadOffer
      api={api}
      kiosk={props.kiosk ?? false}
      running={props.running === undefined ? "b1" : props.running}
      onReload={onReload}
    />
  );
  return { onReload, calls };
}

const settle = () => act(() => vi.advanceTimersByTimeAsync(0));

beforeEach(() => {
  sessionStorage.clear();
  vi.useFakeTimers();
  serverBuild = "b1";
  reachable = true;
});
afterEach(() => vi.useRealTimers());

describe("ReloadOffer", () => {
  it("says nothing while the server runs the build the page came from", async () => {
    const { calls } = setup();
    await settle();

    expect(calls).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Reload" })).toBeNull();
  });

  it("offers a reload once the server runs another build", async () => {
    const { onReload } = setup();
    await settle();
    serverBuild = "b2";
    await act(() => vi.advanceTimersByTimeAsync(5 * 60 * 1000));

    fireEvent.click(screen.getByRole("button", { name: "Reload" }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("checks again when the tab is shown or the network returns", async () => {
    const { calls } = setup();
    await settle();
    serverBuild = "b2";
    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    await settle();

    expect(calls).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Reload" })).toBeTruthy();
  });

  it("keeps quiet when the server cannot be reached", async () => {
    reachable = false;
    setup();
    await settle();

    expect(screen.queryByRole("button", { name: "Reload" })).toBeNull();
  });

  it("reloads a kiosk by itself, with nobody there to press the button", async () => {
    serverBuild = "b2";
    const { onReload } = setup({ kiosk: true });
    await settle();

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it("reloads a kiosk once per build, even if the page still comes back old", async () => {
    serverBuild = "b2";
    const first = setup({ kiosk: true });
    await settle();
    cleanup();
    const second = setup({ kiosk: true });
    await settle();

    expect(first.onReload).toHaveBeenCalledTimes(1);
    expect(second.onReload).not.toHaveBeenCalled();
  });

  it("does nothing when the page does not know its build (dev server)", async () => {
    serverBuild = "b2";
    const { calls } = setup({ running: null });
    await settle();

    expect(calls).toHaveLength(0);
  });
});

describe("runningBuildId", () => {
  it("reads the id the shell was served with", () => {
    document.head.innerHTML = '<meta name="sb-build" content="abc">';
    expect(runningBuildId()).toBe("abc");
    document.head.innerHTML = "";
    expect(runningBuildId()).toBeNull();
  });
});
