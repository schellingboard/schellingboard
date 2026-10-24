import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { snapshot as base } from "../replica/snapshot-fixture";
import { comment, fakeComments } from "./comments-test-support";
import { SessionComments } from "./session-comments";
import { renderScheduled } from "./test-support";

function show(
  handle = fakeComments(),
  { me = base.me }: { me?: typeof base.me } = {}
) {
  renderScheduled(<SessionComments sessionId="s" />, {
    snapshot: { ...base, me },
    actions: { comments: () => handle },
  });
  return handle;
}

const scrollIntoView = vi.fn();

beforeEach(() => {
  Element.prototype.scrollIntoView = scrollIntoView as never;
  window.location.hash = "";
});
afterEach(cleanup);

describe("a session's comments", () => {
  it(
    "loads them on open and lets go of the query on close",
    { tags: ["010-US2"] },
    () => {
      const handle = show();
      expect(handle.query.loadMore).toHaveBeenCalledTimes(1);
      cleanup();
      expect(handle.query.destroy).toHaveBeenCalled();
    }
  );

  it(
    "says they are loading, before the first page",
    { tags: ["010-US2"] },
    () => {
      show(fakeComments([], { status: "loading" }));
      expect(screen.getByText("Loading comments...")).toBeTruthy();
    }
  );

  it(
    "says they could not be loaded, and tries again",
    { tags: ["010-US2"] },
    async () => {
      const handle = show(fakeComments([], { status: "error", code: "x" }));
      expect(screen.getByText("Comments could not be loaded")).toBeTruthy();
      await userEvent.click(screen.getByRole("button", { name: "Try again" }));
      expect(handle.query.loadMore).toHaveBeenCalledTimes(2);
    }
  );

  it(
    "counts the live comments and shows each with its author",
    { tags: ["010-US2"] },
    () => {
      show(
        fakeComments([
          comment("a", { body: "Hello **there**" }),
          comment("b", { deleted: true, body: "", author: null }),
        ])
      );
      expect(screen.getByRole("heading", { name: "1 comment" })).toBeTruthy();
      expect(
        screen.getByRole("link", { name: "HOST" }).getAttribute("href")
      ).toBe("/legacy/guests/host");
      expect(screen.getByText("there").tagName).toBe("STRONG");
      expect(screen.getByText("Comment deleted")).toBeTruthy();
    }
  );

  it("marks a comment as edited", { tags: ["010-US4"] }, () => {
    show(
      fakeComments([comment("a", { editedTime: "2026-06-02T11:00:00.000Z" })])
    );
    expect(screen.getByText("(edited)")).toBeTruthy();
  });

  it(
    "does not claim a total while more pages may follow",
    { tags: ["010-US2"] },
    () => {
      show(fakeComments([comment("a")], { hasMore: true }));
      expect(screen.getByRole("heading", { name: "1+ comments" })).toBeTruthy();
    }
  );

  it("asks for more when there is more", { tags: ["010-US2"] }, async () => {
    const handle = show(fakeComments([comment("a")], { hasMore: true }));
    await userEvent.click(
      screen.getByRole("button", { name: "Load more comments" })
    );
    expect(handle.query.loadMore).toHaveBeenCalledTimes(2);
  });

  it("collapses a comment", { tags: ["010-US2"] }, async () => {
    show(fakeComments([comment("a")]));
    await userEvent.click(
      screen.getByRole("button", { name: "Collapse comment" })
    );
    expect(screen.queryByText("body of a")).toBeNull();
    expect(screen.getByRole("button", { name: "Expand comment" })).toBeTruthy();
  });

  it("nests replies under their comment", { tags: ["010-US5"] }, () => {
    show(fakeComments([comment("a"), comment("b", { parentId: "a" })]));
    expect(screen.getByText("body of b")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "2 comments" })).toBeTruthy();
  });
});

describe("writing comments", () => {
  it("posts one and empties the box", { tags: ["010-US2"] }, async () => {
    const handle = show();
    const box = screen.getByLabelText("Add a comment");
    const post = screen.getByRole("button", { name: "Comment" });
    expect((post as HTMLButtonElement).disabled).toBe(true);
    await userEvent.type(box, "Nice");
    await userEvent.click(post);
    expect(handle.controller.create).toHaveBeenCalledWith("Nice");
    await vi.waitFor(() => expect((box as HTMLTextAreaElement).value).toBe(""));
  });

  it(
    "keeps the text and says why when posting fails",
    { tags: ["010-US2"] },
    async () => {
      const handle = show();
      vi.mocked(handle.controller.create).mockResolvedValue({
        ok: false,
        message: "Comment cannot be empty",
      });
      const box = screen.getByLabelText("Add a comment");
      await userEvent.type(box, "x");
      await userEvent.click(screen.getByRole("button", { name: "Comment" }));
      expect(await screen.findByText("Comment cannot be empty")).toBeTruthy();
      expect((box as HTMLTextAreaElement).value).toBe("x");
    }
  );

  it(
    "asks who the reader is instead of offering the box",
    { tags: ["010-US2"] },
    () => {
      show(fakeComments(), { me: null });
      expect(
        screen.getByText("Select your name to leave a comment.")
      ).toBeTruthy();
      expect(screen.queryByLabelText("Add a comment")).toBeNull();
    }
  );

  it("replies under a comment", { tags: ["010-US5"] }, async () => {
    const handle = show(fakeComments([comment("a")]));
    await userEvent.click(screen.getByRole("button", { name: "Reply" }));
    await userEvent.type(screen.getByLabelText("Write a reply"), "Yes");
    await userEvent.click(
      screen.getAllByRole("button", { name: "Reply" }).at(-1)!
    );
    expect(handle.controller.create).toHaveBeenCalledWith("Yes", "a");
  });

  it(
    "lets the author edit, and no one else",
    { tags: ["010-US4"] },
    async () => {
      const handle = show(
        fakeComments([
          comment("a", { author: { id: "mia", name: "MIA" } }),
          comment("b"),
        ])
      );
      expect(screen.getAllByRole("button", { name: "Edit" })).toHaveLength(1);
      await userEvent.click(screen.getByRole("button", { name: "Edit" }));
      const box = screen.getByLabelText("Edit your comment");
      expect((box as HTMLTextAreaElement).value).toBe("body of a");
      await userEvent.clear(box);
      await userEvent.type(box, "better");
      await userEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(handle.controller.edit).toHaveBeenCalledWith("a", "better");
      await vi.waitFor(() =>
        expect(screen.queryByLabelText("Edit your comment")).toBeNull()
      );
    }
  );

  it("deletes only after a confirmation", { tags: ["010-US4"] }, async () => {
    const handle = show(
      fakeComments([comment("a", { author: { id: "mia", name: "MIA" } })])
    );
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(handle.controller.remove).not.toHaveBeenCalled();
    expect(
      screen.getByText("Delete this comment? This cannot be undone.")
    ).toBeTruthy();
    await userEvent.click(
      within(screen.getByRole("dialog", { name: "Delete comment" })).getByRole(
        "button",
        { name: "Delete" }
      )
    );
    expect(handle.controller.remove).toHaveBeenCalledWith("a");
  });
});

describe("liking comments", () => {
  it("likes and takes the like back", { tags: ["010-US6"] }, async () => {
    const handle = show(fakeComments([comment("a")]));
    await userEvent.click(screen.getByRole("button", { name: "Like" }));
    expect(handle.controller.setLiked).toHaveBeenCalledWith("a", true);
    cleanup();
    const liked = show(
      fakeComments([
        comment("a", { likes: [{ id: "mia", name: "MIA", avatarUrl: null }] }),
      ])
    );
    const button = screen.getByRole("button", { name: "Liked" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    await userEvent.click(button);
    expect(liked.controller.setLiked).toHaveBeenCalledWith("a", false);
  });

  it("names who liked it", { tags: ["010-US6"] }, async () => {
    show(
      fakeComments([
        comment("a", {
          likes: [
            { id: "zed", name: "Zed", avatarUrl: null },
            { id: "abe", name: "Abe", avatarUrl: null },
          ],
        }),
      ])
    );
    await userEvent.click(screen.getByRole("button", { name: "2 likes" }));
    const list = within(screen.getByRole("dialog", { name: "Liked by" }));
    expect(list.getByRole("link", { name: "Zed" }).getAttribute("href")).toBe(
      "/legacy/guests/zed"
    );
  });

  it("offers no like without a name", { tags: ["010-US6"] }, () => {
    show(fakeComments([comment("a")]), { me: null });
    expect(screen.queryByRole("button", { name: "Like" })).toBeNull();
  });
});

describe("a comment's permalink", () => {
  it(
    "links the session's address with the comment",
    { tags: ["010-US5"] },
    () => {
      show(fakeComments([comment("a")]));
      const link = screen.getByRole("link", { name: /^\d/ });
      expect(link.getAttribute("href")).toBe("/conf?viewSession=s#comment-a");
    }
  );

  it("scrolls to the comment the address names", { tags: ["010-US5"] }, () => {
    window.location.hash = "#comment-b";
    show(fakeComments([comment("a"), comment("b")]));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it(
    "scrolls once, not again at every like or edit",
    { tags: ["010-US5"] },
    () => {
      window.location.hash = "#comment-b";
      const handle = show(fakeComments([comment("a"), comment("b")]));
      scrollIntoView.mockClear();
      act(() => {
        handle.state.set({
          ...handle.state.get(),
          items: [comment("a"), comment("b", { body: "changed" })],
        });
      });
      expect(scrollIntoView).not.toHaveBeenCalled();
    }
  );
});
