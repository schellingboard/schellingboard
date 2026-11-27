import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProxyNotice } from "./proxy-notice";

afterEach(cleanup);

describe("the unknown email notice", { tags: ["025-US2"] }, () => {
  it("says the site has no person with that email", () => {
    render(<ProxyNotice unknownEmail />);
    expect(screen.getByRole("status").textContent).toContain(
      "no person with the email"
    );
  });

  it("shows nothing otherwise", () => {
    render(<ProxyNotice unknownEmail={false} />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});
