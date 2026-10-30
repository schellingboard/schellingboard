import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createAccountSecurityQuery } from "./account-security";

describe("the account security page's data", { tags: ["003-US3"] }, () => {
  it("is ready once the credentials and the sessions are in", async () => {
    const { api } = fakeApi((call) =>
      call.path.endsWith("/me/credentials")
        ? Response.json({ authProtected: true, username: "ada" })
        : Response.json([])
    );
    const query = createAccountSecurityQuery({ api });
    expect(query.get().status).toBe("loading");

    await query.load();

    expect(query.get()).toEqual({
      status: "ready",
      authProtected: true,
      username: "ada",
      sessions: [],
    });
  });

  it("reports why the viewer cannot have them", async () => {
    const { api } = fakeApi(() => problem(403, "guest.protected"));
    const query = createAccountSecurityQuery({ api });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "guest.protected" });
  });
});
