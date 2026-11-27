import { describe, expect, it } from "vitest";

import { actingGuestRefusal } from "./acting-guest-message";

describe("actingGuestRefusal", () => {
  it("asks for a name before the task", () => {
    expect(actingGuestRefusal("guest.unselected", "editProfile")).toBe(
      "Select your name to edit your profile."
    );
  });

  it("asks to switch to a protected name before the task", () => {
    expect(actingGuestRefusal("guest.protected", "seeComments")).toBe(
      "This name is protected. Switch to it with your password or emailed code — via the name chip in the header — before seeing your comments."
    );
  });
});
