import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi, problem, type FakeHandler } from "../../commands/fake-api";
import { signInCalls } from "../../commands/sign-in";
import { NoticeProvider } from "../../ui/notices";
import { JoinScreen } from "./join-screen";

afterEach(cleanup);

function setup(handler: FakeHandler) {
  const { api, calls } = fakeApi(handler);
  const onJoined = vi.fn();
  render(
    <NoticeProvider>
      <JoinScreen
        calls={signInCalls(api)}
        token="tok"
        guests={[{ id: "g1", name: "Ada" }]}
        onJoined={onJoined}
      />
    </NoticeProvider>
  );
  return { calls, onJoined };
}

describe("the join page", { tags: ["003-US6"] }, () => {
  it("exchanges the link and opens the event", async () => {
    const { calls, onJoined } = setup(() =>
      Response.json({ guestId: "g1", eventSlug: "camp", joined: true })
    );

    await vi.waitFor(() => expect(onJoined).toHaveBeenCalledWith("camp"));
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      path: "/api/v1/auth/join",
      body: { token: "tok" },
    });
  });

  it("asks for a sign-in as the guest when a password was set", async () => {
    const { onJoined } = setup(() =>
      Response.json({ guestId: "g1", eventSlug: "camp", joined: false })
    );

    const link = await screen.findByRole("link", { name: "Sign in as Ada" });

    expect(link.getAttribute("href")).toBe(
      "/auth/login?guest=g1&redirect=%2Fjoin%2Ftok"
    );
    expect(onJoined).not.toHaveBeenCalled();
  });

  it("says a replaced link is no longer valid", async () => {
    setup(() => problem(403, "join.tokenWrong", "This link is invalid"));

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("no longer works")
    );
  });
});
