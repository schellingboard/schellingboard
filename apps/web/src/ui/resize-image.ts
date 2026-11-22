import { t } from "@lingui/core/macro";
import { cropBox, type CropRegion } from "@schellingboard/domain/image-crop";

export type CropShape = { aspectRatio: number; maxWidth: number };

function toBlob(canvas: HTMLCanvasElement, file: Blob) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      file.type.startsWith("image/") ? file.type : "image/jpeg",
      0.9
    );
  })
    .then((blob) => ({ blob }))
    .catch((e) => {
      console.error(e);
      return { error: t`Failed to resize image` };
    });
}

/** Cuts `region` (by default the centre) out of the image, at the shape's size. */
export async function cropImage(
  canvas: HTMLCanvasElement,
  file: Blob,
  shape: CropShape,
  region?: CropRegion
): Promise<{ blob: Blob } | { error: string }> {
  const bitmap = await createImageBitmap(file);
  const box = cropBox(
    bitmap.width,
    bitmap.height,
    shape.aspectRatio,
    shape.maxWidth,
    region
  );
  canvas.width = box.width;
  canvas.height = box.height;

  try {
    canvas
      .getContext("2d")!
      .drawImage(
        bitmap,
        box.sx,
        box.sy,
        box.sw,
        box.sh,
        0,
        0,
        box.width,
        box.height
      );
  } catch (e) {
    console.error(e);
    return { error: t`Failed to draw image` };
  }

  return toBlob(canvas, file);
}

/** {@link cropImage} as a file of the same name; the original if it can't be cut. */
export async function cropFile(
  file: File,
  shape: CropShape,
  region: CropRegion
): Promise<File> {
  try {
    const result = await cropImage(
      document.createElement("canvas"),
      file,
      shape,
      region
    );
    if ("error" in result) return file;
    return new File([result.blob], file.name, { type: result.blob.type });
  } catch {
    return file;
  }
}
