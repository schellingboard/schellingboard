import { cleanup, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { comment, fakeComments } from "../comments/comments-test-support";
import { SessionComments } from "./session-comments";
import { renderScheduled } from "./test-support";

afterEach(cleanup);

it(
  "links a comment's time to the session over the schedule",
  { tags: ["010-US5"] },
  () => {
    renderScheduled(<SessionComments sessionId="s" />, {
      actions: { comments: () => fakeComments([comment("a")]) },
    });

    expect(screen.getByRole("link", { name: /^\d/ }).getAttribute("href")).toBe(
      "/conf?viewSession=s#comment-a"
    );
  }
);
