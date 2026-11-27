import { expect, it, vi } from "vitest";

import { hardNavigate } from "./hard-navigate";
import { goToSignIn } from "./sign-in-redirect";

vi.mock("./hard-navigate", () => ({ hardNavigate: vi.fn() }));

it("opens the login page and returns to the current page", () => {
  history.replaceState(null, "", "/conf/proposals?q=a#top");

  goToSignIn();
  goToSignIn("g1");

  expect(hardNavigate).toHaveBeenNthCalledWith(
    1,
    "/auth/login?redirect=%2Fconf%2Fproposals%3Fq%3Da%23top"
  );
  expect(hardNavigate).toHaveBeenNthCalledWith(
    2,
    "/auth/login?guest=g1&redirect=%2Fconf%2Fproposals%3Fq%3Da%23top"
  );
});
