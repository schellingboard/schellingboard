import { centredCrop, cropBox } from "@schellingboard/domain/image-crop";
import { describe, expect, it } from "vitest";

describe("centredCrop", () => {
  it("spans the full height of an image wider than the shape", () => {
    expect(centredCrop(1000, 300, 4 / 3)).toEqual({
      x: 0.3,
      y: 0,
      width: 0.4,
      height: 1,
    });
  });

  it("spans the full width of an image taller than the shape", () => {
    expect(centredCrop(100, 200, 1)).toEqual({
      x: 0,
      y: 0.25,
      width: 1,
      height: 0.5,
    });
  });
});

describe("cropBox", () => {
  it("takes the chosen part of the image and scales it down to the cap", () => {
    expect(
      cropBox(4000, 3000, 1, 1024, { x: 0.5, y: 0, width: 0.5, height: 2 / 3 })
    ).toEqual({
      sx: 2000,
      sy: 0,
      sw: 2000,
      sh: 2000,
      width: 1024,
      height: 1024,
    });
  });

  it("never enlarges a small crop", () => {
    expect(
      cropBox(400, 300, 4 / 3, 1200, { x: 0, y: 0, width: 0.5, height: 0.5 })
    ).toEqual({ sx: 0, sy: 0, sw: 200, sh: 150, width: 200, height: 150 });
  });

  it("keeps a crop that strays outside the image inside it", () => {
    expect(
      cropBox(100, 100, 1, 1024, { x: 0.8, y: -0.1, width: 0.5, height: 0.5 })
    ).toEqual({ sx: 50, sy: 0, sw: 50, sh: 50, width: 50, height: 50 });
  });

  it("crops around the centre when no part is chosen", () => {
    expect(cropBox(800, 800, 4 / 3, 1200)).toEqual({
      sx: 0,
      sy: 100,
      sw: 800,
      sh: 600,
      width: 800,
      height: 600,
    });
  });
});
