import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Avatar } from "./avatar";

afterEach(cleanup);

describe("Avatar", () => {
  it(
    "keeps the initials under the photo so a loading or broken image shows them",
    { tags: ["011-US4"] },
    () => {
      const { container } = render(
        <Avatar name="Ada Lovelace" image="https://example.com/a.png" />
      );

      expect(screen.getByText("AL")).toBeTruthy();
      expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
    }
  );

  it("shows the initials alone without a photo", () => {
    const { container } = render(<Avatar name="Ada Lovelace" />);

    expect(screen.getByText("AL")).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });
});
