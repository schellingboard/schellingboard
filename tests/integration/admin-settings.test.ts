// @module-tag 015-US5
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import fs from "fs";
import os from "os";
import path from "path";

import {
  loginAsAdmin,
  logoutAdmin,
  updateSettingsAction,
} from "../helpers/admin-api";
import { setupTestDb, resetTestDb } from "../helpers/db";
import { getRepositories } from "@/db/container";
import { createImageFile } from "@/tests/helpers/utils";
import { DEFAULT_SITE_SETTINGS } from "@schellingboard/domain/site-settings";
import { unitOfWork } from "@/server/kernel/unit-of-work";
import { createSettingsUseCases } from "@/server/modules/settings/module";
import { mapImages } from "@/utils/map-image";
import { uowFailingAt } from "../helpers/changes";

const VALID_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars

function settingsFormData(
  overrides: Record<string, string | File> = {}
): FormData {
  const formData = new FormData();
  formData.set("title", "My Event");
  formData.set("description", "Come along");
  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }
  return formData;
}

let uploadsDir: string;

describe("admin settings actions", () => {
  beforeAll(() => setupTestDb());

  beforeEach(async () => {
    resetTestDb();
    logoutAdmin();
    uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-test-"));
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    vi.stubEnv("SB_UPLOADS_DIR", uploadsDir);
    await loginAsAdmin();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  });

  it("defaults to the built-in settings before any update", async () => {
    expect(await getRepositories().settings.get()).toEqual(
      DEFAULT_SITE_SETTINGS
    );
  });

  it("rejects updates without an admin cookie", async () => {
    logoutAdmin();
    expect(await updateSettingsAction(settingsFormData())).toEqual({
      ok: false,
      error: "Unauthorized",
    });
    expect((await getRepositories().settings.get()).title).toBe(
      DEFAULT_SITE_SETTINGS.title
    );
  });

  it("updates title and description", async () => {
    const result = await updateSettingsAction(settingsFormData());
    expect(result).toEqual({ ok: true });

    const settings = await getRepositories().settings.get();
    expect(settings.title).toBe("My Event");
    expect(settings.description).toBe("Come along");
  });

  it("requires a title", async () => {
    const result = await updateSettingsAction(settingsFormData({ title: "" }));
    expect(result).toEqual({ ok: false, error: "Title is required" });
  });

  it("saves an uploaded map image and stores its URL", async () => {
    const image = await createImageFile(800, 500, "map.png");
    const result = await updateSettingsAction(settingsFormData({ image }));
    expect(result).toEqual({ ok: true });

    const settings = await getRepositories().settings.get();
    expect(settings.mapImageUrl).toMatch(/^\/media\/site\/map-.+\.png$/);
    expect(fs.readdirSync(path.join(uploadsDir, "site"))).toEqual([
      path.basename(settings.mapImageUrl),
    ]);
  });

  it("rejects an invalid image without changing settings", async () => {
    const bad = new File([new Uint8Array([1, 2, 3])], "map.png", {
      type: "image/png",
    });
    const result = await updateSettingsAction(settingsFormData({ image: bad }));
    expect(result.ok).toBe(false);
    expect((await getRepositories().settings.get()).mapImageUrl).toBe("");
  });

  it("removes the map when removeMap is set", async () => {
    const image = await createImageFile(800, 500, "map.png");
    await updateSettingsAction(settingsFormData({ image }));
    expect((await getRepositories().settings.get()).mapImageUrl).not.toBe("");

    const result = await updateSettingsAction(
      settingsFormData({ removeMap: "on" })
    );
    expect(result).toEqual({ ok: true });

    expect((await getRepositories().settings.get()).mapImageUrl).toBe("");
    expect(fs.readdirSync(path.join(uploadsDir, "site"))).toEqual([]);
  });

  it(
    "keeps the old map and deletes the new file when a save fails",
    { tags: ["019-US7"] },
    async () => {
      const ADMIN = { admin: true, guest: null };
      const settings = (uow = unitOfWork) =>
        createSettingsUseCases({
          repos: getRepositories(),
          maps: mapImages,
          uow,
        });
      const image = async () =>
        Buffer.from(
          await (await createImageFile(800, 500, "map.png")).arrayBuffer()
        );
      const first = await settings().updateSiteSettings(ADMIN, {
        title: "T",
        description: "",
        image: await image(),
      });
      if (!first.ok) throw new Error(first.error.code);

      await expect(
        settings(uowFailingAt("settings", "update")).updateSiteSettings(ADMIN, {
          title: "T",
          description: "",
          image: await image(),
        })
      ).rejects.toThrow();

      expect((await getRepositories().settings.get()).mapImageUrl).toBe(
        first.value.mapImageUrl
      );
      expect(fs.readdirSync(path.join(uploadsDir, "site"))).toEqual([
        path.basename(first.value.mapImageUrl),
      ]);
    }
  );
});
