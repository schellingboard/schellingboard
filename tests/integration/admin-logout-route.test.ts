// @module-tag 015-US1
import { describe, expect, it, vi } from "vitest";

const set = vi.fn();
vi.mock("next/headers", () => ({ cookies: () => Promise.resolve({ set }) }));

import { POST } from "@/app/api/admin/logout/route";
import { ADMIN_VERIFIED_HEADER, createAdminLogoutCookie } from "@/utils/auth";

describe("POST /api/admin/logout", () => {
  it("clears the admin login", async () => {
    const response = await POST(
      new Request("http://test/api/admin/logout", {
        method: "POST",
        headers: { [ADMIN_VERIFIED_HEADER]: "1" },
      })
    );
    expect(response.status).toBe(204);
    expect(set).toHaveBeenCalledWith(createAdminLogoutCookie());
  });
});
