import { describe, expect, it, vi } from "vitest";

const set = vi.fn();
vi.mock("next/headers", () => ({ cookies: () => Promise.resolve({ set }) }));

import { POST } from "@/app/api/auth/logout/route";
import { createGuestLogoutCookie, createLogoutCookie } from "@/utils/auth";

describe("POST /api/auth/logout", () => {
  it("clears the site login and the guest name", async () => {
    const response = await POST();
    expect(response.status).toBe(204);
    expect(set).toHaveBeenCalledWith(createLogoutCookie());
    expect(set).toHaveBeenCalledWith(createGuestLogoutCookie());
    expect(createLogoutCookie()).toMatchObject({ value: "", maxAge: 0 });
    expect(createGuestLogoutCookie()).toMatchObject({ value: "", maxAge: 0 });
  });
});
