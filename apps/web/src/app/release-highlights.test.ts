import { i18n } from "@lingui/core";
import {
  releaseNotes,
  SHOWN_RELEASES,
} from "@schellingboard/domain/release-notes";
import { describe, expect, it } from "vitest";

import { releaseHighlights } from "./release-highlights";

const shown = releaseNotes.slice(0, SHOWN_RELEASES);

describe("in-app release highlights", () => {
  it("exist for every release the modal shows", () => {
    for (const note of shown) {
      expect(releaseHighlights[note.version], note.version).toBeDefined();
    }
  });

  it("belong to a release the domain lists", () => {
    const versions = releaseNotes.map((note) => note.version);
    for (const version of Object.keys(releaseHighlights)) {
      expect(versions, version).toContain(version);
    }
  });

  it("say something, briefly, in at most five points", () => {
    for (const note of shown) {
      const highlights = releaseHighlights[note.version];
      // The reopened Unreleased entry starts empty and fills in as changes land.
      if (note.date !== undefined) expect(highlights.length).toBeGreaterThan(0);
      expect(highlights.length).toBeLessThanOrEqual(5);
      for (const descriptor of highlights) {
        const text = i18n._(descriptor);
        expect(text.trim()).toBe(text);
        expect(text.length).toBeLessThanOrEqual(200);
        expect(text.startsWith("**")).toBe(true);
      }
    }
  });
});
