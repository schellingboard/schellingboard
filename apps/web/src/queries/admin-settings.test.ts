import { describe, expect, it } from "vitest";
import { fakeApi, problem } from "../commands/fake-api";
import { createAdminSettingsQuery } from "./admin-settings";

describe("the admin settings query", { tags: ["015-US5"] }, () => {
  it("reads the site settings", async () => {
    const settings = { title: "Con", description: "About", mapImageUrl: "" };
    const { api } = fakeApi(() => Response.json(settings));
    const query = createAdminSettingsQuery({ api });
    expect(query.get()).toEqual({ status: "loading" });

    await query.load();

    expect(query.get()).toEqual({ status: "ready", settings });
  });

  it("reports why it could not load", async () => {
    const { api } = fakeApi(() => problem(403, "admin.required"));
    const query = createAdminSettingsQuery({ api });

    await query.load();

    expect(query.get()).toEqual({ status: "error", code: "admin.required" });
  });
});
