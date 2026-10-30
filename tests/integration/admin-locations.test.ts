// @module-tag 017-US1
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
  createLocationAction,
  deleteLocationAction,
  loginAsAdmin,
  logoutAdmin,
  moveLocationAction,
  updateLocationAction,
} from "../helpers/admin-api";
import { setupTestDb, resetTestDb } from "../helpers/db";
import {
  createEvent,
  createLocation,
  createSession,
} from "../helpers/factories";
import { getRepositories } from "@/db/container";
import { createImageFile } from "@/tests/helpers/utils";
import { locationSchema } from "@schellingboard/contracts/location";
import { z } from "zod";

const VALID_SECRET = "0123456789abcdef0123456789abcdef"; // 32 chars

const baseLocationData = {
  name: "Main Hall",
  description: "The big one",
  capacity: 50,
  color: "teal",
} satisfies Partial<z.input<typeof locationSchema>>;

async function makeImageFile(
  width: number,
  height: number,
  name = "room.png"
): Promise<File> {
  return createImageFile(width, height, name);
}

let uploadsDir: string;
const imagePath = (url: string) =>
  path.join(uploadsDir, "locations", path.basename(url));

describe("admin location actions", () => {
  beforeAll(() => setupTestDb());

  beforeEach(async () => {
    resetTestDb();
    logoutAdmin();
    uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-test-"));
    vi.stubEnv("ADMIN_PASSWORD", "admin-pw");
    vi.stubEnv("AUTH_SECRET", VALID_SECRET);
    vi.stubEnv("SB_UPLOADS_DIR", uploadsDir);
    await loginAsAdmin();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  });

  describe("authorization", () => {
    it("rejects all actions without an admin cookie", async () => {
      const location = await createLocation();
      logoutAdmin();
      expect(await createLocationAction(baseLocationData)).toEqual({
        ok: false,
        error: "Unauthorized",
      });
      expect(
        await updateLocationAction({
          ...baseLocationData,
          id: location.id,
          expectedVersion: location.version,
          name: "Hacked",
        })
      ).toEqual({ ok: false, error: "Unauthorized" });
      expect(await deleteLocationAction({ id: location.id })).toEqual({
        ok: false,
        error: "Unauthorized",
      });
      expect(
        await moveLocationAction({
          id: location.id,
          expectedVersion: location.version,
          direction: "up",
        })
      ).toEqual({ ok: false, error: "Unauthorized" });
      const after = await getRepositories().locations.findById(location.id);
      expect(after?.name).toBe(location.name);
    });
  });

  describe("createLocationAction", () => {
    it("creates a location with all fields", async () => {
      const formData = {
        ...baseLocationData,
        areaDescription: "First floor",
        bookable: true,
      };
      const result = await createLocationAction(formData);
      expect(result).toEqual({ ok: true });

      const all = await getRepositories().locations.list();
      expect(all).toHaveLength(1);
      expect(all[0]).toMatchObject({
        name: "Main Hall",
        description: "The big one",
        capacity: 50,
        color: "teal",
        bookable: true,
        areaDescription: "First floor",
        imageUrl: "",
      });
    });

    // The form always submits a string, so a blank area description must be
    // stored as unset — the schedule grid renders a spacer for a missing one
    // and would otherwise collapse the row.
    it("stores a blank area description as unset", async () => {
      const result = await createLocationAction({
        ...baseLocationData,
        areaDescription: "  ",
      });
      expect(result).toEqual({ ok: true });

      const [created] = await getRepositories().locations.list();
      expect(created.areaDescription).toBeUndefined();
    });

    it("coerces an invalid colour to the default palette name", async () => {
      const result = await createLocationAction({
        ...baseLocationData,
        color: "#aabbcc",
      });
      expect(result).toEqual({ ok: true });

      const [created] = await getRepositories().locations.list();
      expect(created.color).toBe("slate");
    });

    it("appends new locations at the end of the sort order", async () => {
      await createLocationAction({ ...baseLocationData, name: "A" });
      await createLocationAction({ ...baseLocationData, name: "B" });
      const all = await getRepositories().locations.list();
      expect(all.map((l) => l.name)).toEqual(["A", "B"]);
      expect(all[1].sortIndex).toBeGreaterThan(all[0].sortIndex);
    });

    it("assigns the location to the given events", async () => {
      const event = await createEvent();
      const formData = {
        ...baseLocationData,
        eventIds: [event.id],
      };
      const result = await createLocationAction(formData);
      expect(result).toEqual({ ok: true });

      const { locations } = getRepositories();
      const [created] = await locations.list();
      expect(await locations.listEventIds(created.id)).toEqual([event.id]);
    });

    it("rejects unknown event ids", async () => {
      const formData = {
        ...baseLocationData,
        eventIds: ["no-such-event"],
      };
      const result = await createLocationAction(formData);
      expect(result).toMatchObject({
        ok: false,
        error: [{ message: "Unknown event", path: ["eventIds"] }],
      });
      expect(await getRepositories().locations.list()).toEqual([]);
    });

    it("requires a name", async () => {
      const result = await createLocationAction({
        ...baseLocationData,
        name: "  ",
      });
      expect(result).toMatchObject({
        ok: false,
        error: [{ message: "Name is required", path: ["name"] }],
      });
    });

    it("rejects a negative capacity", async () => {
      const result = await createLocationAction({
        ...baseLocationData,
        capacity: -1,
      });
      expect(result).toMatchObject({
        ok: false,
        error: [
          {
            message: "Capacity must be a non-negative whole number",
            path: ["capacity"],
          },
        ],
      });
    });

    it("accepts a capacity of 0", async () => {
      const result = await createLocationAction({
        ...baseLocationData,
        capacity: 0,
      });
      expect(result).toEqual({ ok: true });

      const [created] = await getRepositories().locations.list();
      expect(created.capacity).toBe(0);
    });

    it("stores a valid image and sets the imageUrl", async () => {
      const formData = {
        ...baseLocationData,
        image: await makeImageFile(800, 600),
      };
      const result = await createLocationAction(formData);
      expect(result).toEqual({ ok: true });

      const [created] = await getRepositories().locations.list();
      expect(created.imageUrl).toMatch(
        new RegExp(`^/media/locations/${created.id}-[0-9a-f-]+\\.png$`)
      );
      expect(fs.existsSync(imagePath(created.imageUrl))).toBe(true);
    });

    it("accepts a 4:3 image whose orientation is specified by EXIF", async () => {
      const formData = {
        ...baseLocationData,
        image: await createImageFile(600, 800, "image.jpg", {
          preprocess: (image) => image.jpeg().withMetadata({ orientation: 6 }),
        }),
      };

      const result = await createLocationAction(formData);

      expect(result).toEqual({ ok: true });

      const [created] = await getRepositories().locations.list();

      expect(created.imageUrl).toMatch(
        new RegExp(`^/media/locations/${created.id}-[0-9a-f-]+\\.jpg$`)
      );
      expect(fs.existsSync(imagePath(created.imageUrl))).toBe(true);
    });

    it("keeps the location and says why the image was refused", async () => {
      const result = await createLocationAction({
        ...baseLocationData,
        image: await makeImageFile(800, 800),
      });
      expect(!result.ok && result.error).toMatch(/4:3/);
      const [saved] = await getRepositories().locations.list();
      expect(saved.imageUrl).toBeFalsy();
    });
  });

  describe("updateLocationAction", () => {
    it("updates fields and event assignments, keeping the existing image", async () => {
      const event = await createEvent();
      const { locations } = getRepositories();
      const location = await createLocation();
      await locations.update(location.id, {
        ...location,
        imageUrl: "/media/locations/existing.png",
      });

      const formData = {
        ...baseLocationData,
        id: location.id,
        name: "Renamed",
        capacity: 10,
        eventIds: [event.id],
        expectedVersion: (await locations.findById(location.id))!.version,
      };
      const result = await updateLocationAction(formData);
      expect(result).toEqual({ ok: true });

      const updated = await locations.findById(location.id);
      expect(updated).toMatchObject({
        name: "Renamed",
        capacity: 10,
        imageUrl: "/media/locations/existing.png",
      });
      expect(await locations.listEventIds(location.id)).toEqual([event.id]);
    });

    it("raises the version only when the location or its events really change", async () => {
      const event = await createEvent();
      const { locations } = getRepositories();
      const location = await createLocation();
      const save = (patch: object) =>
        locations.update(location.id, { ...location, ...patch });

      const resaved = await save({});
      const joined = await save({ eventIds: [event.id] });
      const rejoined = await save({ eventIds: [event.id] });
      const renamed = await save({ name: "Renamed", eventIds: [event.id] });

      expect([location, resaved, joined, rejoined, renamed]).toMatchObject(
        [1, 1, 2, 2, 3].map((version) => ({ version }))
      );
    });

    it("changes nothing when the location has moved past the expected version", async () => {
      const event = await createEvent();
      const { locations } = getRepositories();
      const location = await createLocation({ name: "A" });
      await locations.update(location.id, { ...location, name: "B" });

      const stale = await locations.update(location.id, {
        ...location,
        name: "C",
        eventIds: [event.id],
        expectedVersion: location.version,
      });

      expect(stale).toBeUndefined();
      expect((await locations.findById(location.id))?.name).toBe("B");
      expect(await locations.listEventIds(location.id)).toEqual([]);
    });

    it("refuses an edit from a version the location has moved past", async () => {
      const location = await createLocation();
      const edit = (name: string) =>
        updateLocationAction({
          ...baseLocationData,
          id: location.id,
          name,
          expectedVersion: location.version,
        });

      expect(await edit("First")).toEqual({ ok: true });
      expect(await edit("Second")).toMatchObject({ ok: false });
      expect(
        (await getRepositories().locations.findById(location.id))?.name
      ).toBe("First");
    });

    it("replaces the image when a new one is uploaded", async () => {
      const location = await createLocation();
      const formData = {
        ...baseLocationData,
        id: location.id,
        image: await makeImageFile(800, 600),
        expectedVersion: location.version,
      };
      const result = await updateLocationAction(formData);
      expect(result).toEqual({ ok: true });

      const updated = await getRepositories().locations.findById(location.id);
      expect(updated?.imageUrl).toMatch(`/media/locations/${location.id}-`);
    });

    it("refuses an edit that names no version", async () => {
      const location = await createLocation();
      const result = await updateLocationAction({
        ...baseLocationData,
        id: location.id,
        name: "Renamed",
      } as Parameters<typeof updateLocationAction>[0]);
      expect(result.ok).toBe(false);
      expect(
        (await getRepositories().locations.findById(location.id))?.name
      ).toBe(location.name);
    });

    it("errors for an unknown id", async () => {
      const result = await updateLocationAction({
        ...baseLocationData,
        id: "does-not-exist",
        expectedVersion: 1,
      });
      expect(result).toEqual({ ok: false, error: "Location not found" });
    });
  });

  describe("deleteLocationAction", () => {
    it("errors for an unknown id", async () => {
      const result = await deleteLocationAction({ id: "does-not-exist" });
      expect(result).toEqual({ ok: false, error: "Location not found" });
    });

    it("cascade-deletes session and event links, leaving sessions intact", async () => {
      const repos = getRepositories();
      const event = await createEvent();
      const location = await createLocation();
      const otherLocation = await createLocation();
      await repos.locations.setEventIds(location.id, [event.id]);
      const session = await createSession(event.id, {
        locationIds: [location.id, otherLocation.id],
      });

      expect(await repos.locations.countSessionLinks(location.id)).toBe(1);

      const result = await deleteLocationAction({ id: location.id });
      expect(result).toEqual({ ok: true });

      expect(await repos.locations.findById(location.id)).toBeUndefined();
      const sessionAfter = await repos.sessions.findById(session.id);
      expect(sessionAfter?.locations.map((l) => l.id)).toEqual([
        otherLocation.id,
      ]);
      // Other location untouched
      expect(await repos.locations.findById(otherLocation.id)).toBeDefined();
    });

    it("removes the stored image file", async () => {
      const formData = {
        ...baseLocationData,
        image: await makeImageFile(800, 600),
      };
      await createLocationAction(formData);
      const [created] = await getRepositories().locations.list();
      const file = imagePath(created.imageUrl);
      expect(fs.existsSync(file)).toBe(true);

      await deleteLocationAction({ id: created.id });
      expect(fs.existsSync(file)).toBe(false);
    });
  });

  describe("moveLocationAction", () => {
    it("moves a location up and down", async () => {
      const { locations } = getRepositories();
      await createLocationAction({ ...baseLocationData, name: "A" });
      await createLocationAction({ ...baseLocationData, name: "B" });
      await createLocationAction({ ...baseLocationData, name: "C" });

      const byName = async () => (await locations.list()).map((l) => l.name);
      const move = async (name: string, direction: "up" | "down") => {
        const { id, version } = (await locations.list()).find(
          (l) => l.name === name
        )!;
        return moveLocationAction({ id, direction, expectedVersion: version });
      };

      await move("C", "up");
      expect(await byName()).toEqual(["A", "C", "B"]);

      await move("A", "down");
      expect(await byName()).toEqual(["C", "A", "B"]);
    });

    it("raises the version of the locations that changed places only", async () => {
      const { locations } = getRepositories();
      const a = await createLocation({ name: "A", sortIndex: 0 });
      await createLocation({ name: "B", sortIndex: 1 });
      await createLocation({ name: "C", sortIndex: 2 });

      const stale = await moveLocationAction({
        id: a.id,
        direction: "down",
        expectedVersion: a.version + 1,
      });
      await moveLocationAction({
        id: a.id,
        direction: "down",
        expectedVersion: a.version,
      });

      expect(stale).toMatchObject({ ok: false });
      expect((await locations.list()).map((l) => [l.name, l.version])).toEqual([
        ["B", 2],
        ["A", 2],
        ["C", 1],
      ]);
    });

    it("refuses a move from a version the location has moved past", async () => {
      const { locations } = getRepositories();
      const a = await createLocation({ name: "A", sortIndex: 0 });
      await createLocation({ name: "B", sortIndex: 1 });
      await locations.update(a.id, { ...a, name: "A2" });

      const result = await moveLocationAction({
        id: a.id,
        direction: "down",
        expectedVersion: a.version,
      });

      expect(result).toEqual({
        ok: false,
        error: expect.stringMatching(
          /^Someone changed this location while you edited it/
        ) as string,
      });
      expect((await locations.list()).map((l) => l.name)).toEqual(["A2", "B"]);
    });

    it("refuses a move that names no version", async () => {
      const { locations } = getRepositories();
      const a = await createLocation({ name: "A", sortIndex: 0 });
      await createLocation({ name: "B", sortIndex: 1 });

      const result = await moveLocationAction({
        id: a.id,
        direction: "down",
      } as Parameters<typeof moveLocationAction>[0]);

      expect(result.ok).toBe(false);
      expect((await locations.list()).map((l) => l.name)).toEqual(["A", "B"]);
    });

    it("ignores moves beyond the boundaries", async () => {
      const { locations } = getRepositories();
      await createLocationAction({ ...baseLocationData, name: "A" });
      await createLocationAction({ ...baseLocationData, name: "B" });
      const first = (await locations.list())[0];

      const result = await moveLocationAction({
        id: first.id,
        expectedVersion: first.version,
        direction: "up",
      });
      expect(result).toEqual({ ok: true });
      expect((await locations.list()).map((l) => l.name)).toEqual(["A", "B"]);
    });
  });
});
