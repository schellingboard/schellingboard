import fs from "fs";
import os from "os";
import path from "path";
import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import { setupTestDb, resetTestDb } from "../helpers/db";
import { createGuest } from "../helpers/factories";
import { createImageFile } from "../helpers/utils";
import { getRepositories } from "@/db/container";
import { createPeopleUseCases } from "@/server/modules/people/module";
import type { Actor } from "@/server/kernel/actor";
import type { Result } from "@/server/kernel/result";
import { getImageRepositories } from "@/utils/images";

const NOBODY: Actor = { admin: false, guest: null };
const open = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "open" },
});
const verified = (id: string): Actor => ({
  admin: false,
  guest: { id, level: "verified" },
});
const now = () => new Date();

const people = () =>
  createPeopleUseCases({
    repos: getRepositories(),
    avatars: getImageRepositories().avatars,
    sendTestEmail: async () => {},
  });

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.code);
  return result.value;
}

const code = (result: Result<unknown>) =>
  result.ok ? "ok" : result.error.code;

async function protect(guestId: string) {
  await getRepositories().guests.setAuthProtection(guestId, {
    authProtected: true,
    passwordHash: null,
  });
}

const PROFILE = {
  name: "Ada Lovelace",
  aboutMe: "Engines",
  pronouns: "she/her",
  basedIn: "London",
  prompts: [{ prompt: "Ask me about", answer: "Notes" }],
  languages: ["English"],
  contacts: [{ type: "website" as const, value: "https://ada.example" }],
};

async function png(size: number) {
  return Buffer.from(
    await (await createImageFile(size, size, "a.png")).arrayBuffer()
  );
}

let uploadsDir: string;

beforeAll(() => setupTestDb());

beforeEach(() => {
  resetTestDb();
  uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "uploads-test-"));
  vi.stubEnv("SB_UPLOADS_DIR", uploadsDir);
});

afterEach(() => {
  vi.unstubAllEnvs();
  fs.rmSync(uploadsDir, { recursive: true, force: true });
});

describe("reading a profile", () => {
  it(
    "shows anyone the public profile, never the email or email settings",
    { tags: ["011-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada", email: "ada@example.com" });
      await getRepositories().guests.updateProfile(
        ada.id,
        { ...PROFILE, avatarUrl: null },
        now()
      );

      const profile = value(
        await people().getProfile(NOBODY, { guestId: ada.id })
      );

      expect(profile).toMatchObject({ id: ada.id, ...PROFILE });
      expect(JSON.stringify(profile)).not.toContain("ada@example.com");
      expect(profile).not.toHaveProperty("info");
    }
  );

  it(
    "answers profile.notFound for an unknown guest",
    { tags: ["011-US4"] },
    async () => {
      expect(code(await people().getProfile(NOBODY, { guestId: "nope" }))).toBe(
        "profile.notFound"
      );
    }
  );
});

describe("editing one's own profile", () => {
  it(
    "saves the acting guest's profile and returns it without private fields",
    { tags: ["011-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada", email: "ada@example.com" });

      const saved = value(
        await people().updateMyProfile(open(ada.id), PROFILE, now())
      );

      expect(saved).toMatchObject({ id: ada.id, ...PROFILE });
      expect(saved).not.toHaveProperty("info");
      expect(await getRepositories().guests.findById(ada.id)).toMatchObject(
        PROFILE
      );
    }
  );

  it(
    "refuses nobody, and a protected guest without its verified cookie (#370)",
    { tags: ["011-US1"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });
      await protect(ada.id);

      expect(code(await people().updateMyProfile(NOBODY, PROFILE, now()))).toBe(
        "guest.unselected"
      );
      expect(
        code(await people().updateMyProfile(open(ada.id), PROFILE, now()))
      ).toBe("guest.protected");
      expect(
        code(await people().updateMyProfile(verified(ada.id), PROFILE, now()))
      ).toBe("ok");
    }
  );

  it(
    "keeps the photo when none is given, and removes it when told to",
    { tags: ["011-US2"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });
      const withPhoto = value(
        await people().replaceMyAvatar(
          open(ada.id),
          { image: await png(256) },
          now()
        )
      );
      expect(withPhoto.avatarUrl).toMatch(/^\/media\/avatars\/.+\.png\?v=\d+$/);

      const kept = value(
        await people().updateMyProfile(open(ada.id), PROFILE, now())
      );
      expect(kept.avatarUrl).toBe(withPhoto.avatarUrl);

      const removed = value(await people().removeMyAvatar(open(ada.id), now()));
      expect(removed.avatarUrl).toBeNull();
      expect(fs.readdirSync(path.join(uploadsDir, "avatars"))).toEqual([]);
    }
  );
});

describe("uploading a photo", () => {
  it(
    "refuses an image too small to crop, after checking who is asking",
    { tags: ["011-US2"] },
    async () => {
      const ada = await createGuest({ name: "Ada" });
      const small = await png(64);

      expect(
        code(await people().replaceMyAvatar(NOBODY, { image: small }, now()))
      ).toBe("guest.unselected");
      const refused = await people().replaceMyAvatar(
        open(ada.id),
        { image: small },
        now()
      );
      expect(refused).toMatchObject({
        ok: false,
        error: { code: "avatar.invalid", kind: "invalid" },
      });
      expect(
        (await getRepositories().guests.findById(ada.id))?.avatarUrl ?? null
      ).toBeNull();
    }
  );
});
