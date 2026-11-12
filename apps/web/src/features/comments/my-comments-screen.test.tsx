import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeApi } from "../../commands/fake-api";
import { createMyCommentsQuery } from "../../queries/my-comments";
import { MyCommentsScreen } from "./my-comments-screen";

afterEach(cleanup);

const NOW = new Date("2030-01-01T12:00:00.000Z");
const row = (
  id: string,
  kind: "proposal" | "session" | "profile",
  eventName: string | null,
  extra: object = {}
) => ({
  id,
  kind,
  subjectTitle: `Title ${id}`,
  subjectId: `s-${id}`,
  event: eventName ? { name: eventName, slug: eventName.toLowerCase() } : null,
  body: `Body ${id}`,
  createdTime: "2029-12-30T12:00:00.000Z",
  replyCount: 0,
  likeCount: 0,
  ...extra,
});

async function show(items: ReturnType<typeof row>[], search = "") {
  const { api } = fakeApi(() => Response.json({ items }));
  const query = createMyCommentsQuery({ api });
  await query.load();
  const onParams = vi.fn();
  const onOpen = vi.fn();
  render(
    <MyCommentsScreen
      query={query}
      now={NOW}
      params={new URLSearchParams(search)}
      onParams={onParams}
      onOpen={onOpen}
    />
  );
  return { onParams, onOpen };
}

describe("MyCommentsScreen", () => {
  it("lists comments as links to where they were written, with replies and likes @010-US9", async () => {
    await show([
      row("a", "session", "Alpha", { replyCount: 3, likeCount: 1 }),
      row("b", "profile", null),
    ]);
    const link = screen.getByRole("link", { name: /Session: Title a/ });
    expect(link.getAttribute("href")).toBe("/alpha/sessions/s-a#comment-a");
    expect(link.textContent).toContain("3 replies");
    expect(link.textContent).toContain("1 like");
    expect(link.textContent).toContain("2 days ago");
    expect(screen.getByRole("link", { name: /Profile: Title b/ })).toBeTruthy();
  });

  it("filters by kind and offers the event filter only with several events @010-US9", async () => {
    await show(
      [row("a", "session", "Alpha"), row("b", "proposal", "Alpha")],
      "kind=proposal"
    );
    expect(screen.queryByRole("link", { name: /Session: Title a/ })).toBeNull();
    expect(
      screen.getByRole("link", { name: /Proposal: Title b/ })
    ).toBeTruthy();
    expect(screen.queryByLabelText("Event")).toBeNull();
    cleanup();
    await show([row("a", "session", "Alpha"), row("b", "session", "Beta")]);
    expect(screen.getByLabelText("Event")).toBeTruthy();
  });

  it("changing the kind goes back to the first page @010-US9", async () => {
    const { onParams } = await show([row("a", "session", "Alpha")]);
    await userEvent
      .setup()
      .selectOptions(screen.getByLabelText("Show"), "Sessions");
    expect(onParams).toHaveBeenCalledWith(
      { kind: "session", page: null },
      { push: true }
    );
  });

  it("opens a row without a page load @010-US9", async () => {
    const { onOpen } = await show([row("b", "profile", null)]);
    await userEvent
      .setup()
      .click(screen.getByRole("link", { name: /Profile/ }));
    expect(onOpen).toHaveBeenCalledWith("/guests/s-b#comment-b");
  });

  it("says so when there is nothing yet @010-US9", async () => {
    await show([]);
    expect(
      screen.getByText("You have not written any comments yet.")
    ).toBeTruthy();
  });
});
