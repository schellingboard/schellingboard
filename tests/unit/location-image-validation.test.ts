import { MAX_IMAGE_BYTES } from "@schellingboard/domain/location-image-constraints";
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { getImageRepositories } from "@/utils/images";

async function makeImage(
  width: number,
  height: number,
  format: "png" | "jpeg" | "webp" = "png"
): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 120, g: 80, b: 200 },
    },
  })
    [format]()
    .toBuffer();
}

describe("locationImages.validate", () => {
  it("accepts a 4:3 PNG and returns the png extension", async () => {
    const result = await getImageRepositories().locations.validate(
      await makeImage(800, 600)
    );
    expect(result).toEqual({
      buffer: expect.any(Buffer) as Buffer,
      ext: "png",
    });
  });

  it("accepts JPEG and WebP with their canonical extensions", async () => {
    expect(
      await getImageRepositories().locations.validate(
        await makeImage(800, 600, "jpeg")
      )
    ).toEqual({ buffer: expect.any(Buffer) as Buffer, ext: "jpg" });
    expect(
      await getImageRepositories().locations.validate(
        await makeImage(800, 600, "webp")
      )
    ).toEqual({ buffer: expect.any(Buffer) as Buffer, ext: "webp" });
  });

  const stored = async (width: number, height: number) => {
    const result = await getImageRepositories().locations.validate(
      await makeImage(width, height)
    );
    if ("error" in result) throw new Error(result.error);
    return sharp(result.buffer).metadata();
  };

  it("crops an image of any other shape to 4:3 around its centre", async () => {
    expect(await stored(800, 800)).toMatchObject({ width: 800, height: 600 });
    expect(await stored(1000, 300)).toMatchObject({ width: 400, height: 300 });
  });

  it("downscales a large photo to 1200×900", async () => {
    expect(await stored(4032, 3024)).toMatchObject({
      width: 1200,
      height: 900,
    });
  });

  it("keeps a small image at its own size", async () => {
    expect(await stored(40, 30)).toMatchObject({ width: 40, height: 30 });
  });

  it("rejects an image with more pixels than it may decode", async () => {
    const result = await getImageRepositories().locations.validate(
      await makeImage(10_000, 6_000, "jpeg")
    );
    expect((result as { error: string }).error).toMatch(/too large/);
  });

  it("rejects oversized files without parsing them", async () => {
    const result = await getImageRepositories().locations.validate(
      Buffer.alloc(MAX_IMAGE_BYTES + 1)
    );
    expect((result as { error: string }).error).toMatch(/too large/);
  });

  it("rejects data that is not an image", async () => {
    const result = await getImageRepositories().locations.validate(
      Buffer.from("hello world")
    );
    expect((result as { error: string }).error).toMatch(/not a valid image/);
  });

  it("rejects unsupported formats such as GIF", async () => {
    const gif = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 0, g: 0, b: 0 },
      },
    })
      .gif()
      .toBuffer();
    const result = await getImageRepositories().locations.validate(gif);
    expect((result as { error: string }).error).toMatch(/Unsupported/);
  });
});
