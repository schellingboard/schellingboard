import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createAdminGate } from "./admin-gate";

describe("the admin gate", () => {
  it("is open, with the site title, once an admin read answers", async () => {
    const { api } = fakeApi(() =>
      Response.json({ title: "Con", description: "", mapImageUrl: "" })
    );
    const gate = createAdminGate({ api });
    expect(gate.get()).toEqual({ status: "loading" });

    await gate.load();

    expect(gate.get()).toEqual({ status: "open", title: "Con" });
  });

  it.each([401, 403])("is refused when the read answers %i", async (status) => {
    const { api } = fakeApi(() => problem(status, "admin.required"));
    const gate = createAdminGate({ api });

    await gate.load();

    expect(gate.get()).toEqual({ status: "refused" });
  });

  it("is an error, not a refusal, for any other failure", async () => {
    const { api } = fakeApi(() => problem(500, "internal"));
    const gate = createAdminGate({ api });

    await gate.load();

    expect(gate.get()).toEqual({ status: "error", code: "internal" });
  });
});
