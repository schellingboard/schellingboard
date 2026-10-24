// @module-tag 014-US6
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createReleaseCheck,
  fetchLatestRelease,
} from "@/server/modules/updates/module";

const HOUR = 3_600_000;
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup(fetchLatest = vi.fn()) {
  let now = Date.parse("2026-10-16T10:00:00Z");
  const check = createReleaseCheck({
    fetchLatest,
    now: () => new Date(now),
  });
  // The first answer after a start or an expiry does not wait for GitHub.
  const lookedUp = async (running: string) => {
    check.status(running);
    await settle();
    return check.status(running);
  };
  return { check, fetchLatest, lookedUp, advance: (ms: number) => (now += ms) };
}

const release = (version: string, date = "2026-10-10") => ({ version, date });

describe("release check", () => {
  it(
    "says an update is available when the latest release is newer",
    { tags: ["014-US6"] },
    async () => {
      const { lookedUp } = setup(vi.fn().mockResolvedValue(release("v4.1.0")));

      const status = await lookedUp("v4.0.0");

      expect(status.updateAvailable).toBe(true);
      expect(status.latest).toEqual(release("v4.1.0"));
    }
  );

  it(
    "answers at once, without waiting for GitHub",
    { tags: ["014-US6"] },
    () => {
      const { check } = setup(vi.fn(() => new Promise(() => {})));

      expect(check.status("v4.0.0")).toMatchObject({
        latest: null,
        updateAvailable: false,
      });
    }
  );

  it(
    "says nothing is due when the running version is the latest or newer",
    { tags: ["014-US6"] },
    async () => {
      const { lookedUp } = setup(vi.fn().mockResolvedValue(release("v4.1.0")));

      expect((await lookedUp("v4.1.0")).updateAvailable).toBe(false);
      expect((await lookedUp("v4.2.0")).updateAvailable).toBe(false);
    }
  );

  it("compares numbers, not text", { tags: ["014-US6"] }, async () => {
    const { lookedUp } = setup(vi.fn().mockResolvedValue(release("v4.10.0")));

    expect((await lookedUp("v4.9.0")).updateAvailable).toBe(true);
  });

  it(
    "cannot tell for a build that is not a release",
    { tags: ["014-US6"] },
    async () => {
      const { lookedUp } = setup(vi.fn().mockResolvedValue(release("v4.1.0")));

      expect((await lookedUp("a1b2c3d4-dirty")).updateAvailable).toBe(false);
      expect((await lookedUp("unknown")).updateAvailable).toBe(false);
    }
  );

  it("asks GitHub at most once a day", { tags: ["014-US6"] }, async () => {
    const { lookedUp, check, fetchLatest, advance } = setup(
      vi.fn().mockResolvedValue(release("v4.1.0"))
    );

    await lookedUp("v4.0.0");
    advance(23 * HOUR);
    check.status("v4.0.0");
    await settle();
    expect(fetchLatest).toHaveBeenCalledTimes(1);

    advance(2 * HOUR);
    check.status("v4.0.0");
    await settle();
    expect(fetchLatest).toHaveBeenCalledTimes(2);
  });

  it(
    "shows no update without a network, and tries again within the hour",
    { tags: ["014-US6"] },
    async () => {
      const fetchLatest = vi
        .fn()
        .mockRejectedValueOnce(new Error("offline"))
        .mockResolvedValue(release("v4.1.0"));
      const { check, lookedUp, advance } = setup(fetchLatest);

      expect(await lookedUp("v4.0.0")).toMatchObject({
        latest: null,
        updateAvailable: false,
      });
      expect(fetchLatest).toHaveBeenCalledTimes(1);

      advance(HOUR + 1);
      check.status("v4.0.0");
      await settle();
      expect(check.status("v4.0.0").updateAvailable).toBe(true);
    }
  );

  it(
    "keeps the last answer when a later lookup fails",
    { tags: ["014-US6"] },
    async () => {
      const fetchLatest = vi
        .fn()
        .mockResolvedValueOnce(release("v4.1.0"))
        .mockRejectedValue(new Error("offline"));
      const { check, lookedUp, advance } = setup(fetchLatest);
      await lookedUp("v4.0.0");

      advance(25 * HOUR);
      check.status("v4.0.0");
      await settle();

      expect(check.status("v4.0.0").updateAvailable).toBe(true);
    }
  );

  it(
    "gives the date of the running release from the release notes",
    { tags: ["014-US6"] },
    () => {
      const { check } = setup(vi.fn().mockResolvedValue(null));

      expect(check.status("v4.0.0").current).toEqual({
        version: "v4.0.0",
        date: "2026-10-04",
      });
      expect(check.status("unknown").current.date).toBeNull();
    }
  );
});

describe("the GitHub look-up", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  const github = (body: unknown) => {
    vi.stubEnv("SB_UPDATE_CHECK", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json(body)))
    );
  };

  it(
    "reads the tag and the day it was published",
    { tags: ["014-US6"] },
    async () => {
      github({ tag_name: "v4.1.0", published_at: "2026-10-12T08:00:00Z" });

      expect(await fetchLatestRelease()).toEqual({
        version: "v4.1.0",
        date: "2026-10-12",
      });
    }
  );

  it("fails on an answer without a tag", { tags: ["014-US6"] }, async () => {
    github({ message: "Not Found" });

    await expect(fetchLatestRelease()).rejects.toThrow();
  });

  it.each(["false", "FALSE", "0", "no", "off"])(
    "does not call GitHub when SB_UPDATE_CHECK is %s",
    { tags: ["014-US6"] },
    async (value) => {
      github({ tag_name: "v4.1.0" });
      vi.stubEnv("SB_UPDATE_CHECK", value);

      expect(await fetchLatestRelease()).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    }
  );
});
