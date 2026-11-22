/** A part of an image, in fractions of its width and height. */
export type CropRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** The largest region of the given aspect ratio, around the image's centre. */
export function centredCrop(
  width: number,
  height: number,
  aspectRatio: number
): CropRegion {
  const cropWidth = Math.min(1, (height * aspectRatio) / width);
  const cropHeight = Math.min(1, width / aspectRatio / height);
  return {
    x: (1 - cropWidth) / 2,
    y: (1 - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * The source rectangle of `region`, in pixels and held to the aspect ratio,
 * and the size to draw it at: at most `maxWidth` wide, and never upscaled,
 * since that invents no detail and only costs bytes.
 */
export function cropBox(
  width: number,
  height: number,
  aspectRatio: number,
  maxWidth: number,
  region: CropRegion = centredCrop(width, height, aspectRatio)
) {
  const sw = Math.max(
    1,
    Math.min(
      Math.round(region.width * width),
      width,
      Math.round(height * aspectRatio)
    )
  );
  const sh = clamp(Math.round(sw / aspectRatio), 1, height);
  const out = Math.max(1, Math.min(maxWidth, sw));
  return {
    sx: clamp(Math.round(region.x * width), 0, width - sw),
    sy: clamp(Math.round(region.y * height), 0, height - sh),
    sw,
    sh,
    width: out,
    height: Math.max(1, Math.round(out / aspectRatio)),
  };
}
