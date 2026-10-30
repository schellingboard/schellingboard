import { describe, expect, it, vi } from "vitest";
import { warnAboutAdminPassword } from "@/server/admin-password-notice";

describe("the ADMIN_PASSWORD notice", () => {
  it("warns that the setting does nothing any more", () => {
    const log = vi.fn();
    warnAboutAdminPassword({ ADMIN_PASSWORD: "secret" }, log);
    expect(log).toHaveBeenCalledOnce();
    expect(String(log.mock.calls[0][0])).toContain("site admin");
    expect(String(log.mock.calls[0][0])).not.toContain("secret");
  });

  it("says nothing when it is unset or empty", () => {
    const log = vi.fn();
    warnAboutAdminPassword({}, log);
    warnAboutAdminPassword({ ADMIN_PASSWORD: "" }, log);
    expect(log).not.toHaveBeenCalled();
  });
});
