import "react-image-crop/dist/ReactCrop.css";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import {
  centredCrop,
  type CropRegion,
} from "@schellingboard/domain/image-crop";
import { useEffect, useRef, useState } from "react";
import { type PercentCrop, ReactCrop } from "react-image-crop";

import { Button } from "./button";
import { Dialog } from "./dialog";

// Keeps the preview canvas inside every browser's canvas size limit; the crop
// is a fraction of the picture, so the preview's scale doesn't change it.
const PREVIEW_MAX_SIDE = 2048;

const toRegion = (crop: PercentCrop): CropRegion => ({
  x: crop.x / 100,
  y: crop.y / 100,
  width: crop.width / 100,
  height: crop.height / 100,
});

/** Lets the person pick the part of a chosen picture to keep, in a fixed shape. */
export function ImageCropDialog({
  file,
  aspectRatio,
  round,
  onConfirm,
  onCancel,
}: {
  file: Blob;
  aspectRatio: number;
  round?: boolean;
  /** Without a region when the browser cannot show the picture. */
  onConfirm: (region?: CropRegion) => void;
  onCancel: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<PercentCrop>();
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    let stale = false;
    const decoded =
      typeof createImageBitmap === "function"
        ? createImageBitmap(file)
        : Promise.reject(new Error("createImageBitmap is unsupported"));
    decoded.then(
      (bitmap) => {
        const target = canvas.current;
        if (!stale && target) {
          const scale = Math.min(
            1,
            PREVIEW_MAX_SIDE / Math.max(bitmap.width, bitmap.height)
          );
          target.width = Math.round(bitmap.width * scale);
          target.height = Math.round(bitmap.height * scale);
          target
            .getContext("2d")
            ?.drawImage(bitmap, 0, 0, target.width, target.height);
          const region = centredCrop(bitmap.width, bitmap.height, aspectRatio);
          setCrop({
            unit: "%",
            x: region.x * 100,
            y: region.y * 100,
            width: region.width * 100,
            height: region.height * 100,
          });
        }
        bitmap.close();
      },
      () => {
        if (!stale) setBroken(true);
      }
    );
    return () => {
      stale = true;
    };
  }, [file, aspectRatio]);

  return (
    <Dialog open wide onClose={onCancel} title={t`Choose the part to show`}>
      <p className="-mt-2 mb-3 text-sm text-fg-muted">
        <Trans>
          Drag the frame to move it, or drag its corners to make it bigger or
          smaller.
        </Trans>
      </p>
      <div className="flex justify-center bg-surface-sunken">
        <ReactCrop
          crop={crop}
          onChange={(_, percent) => setCrop(percent)}
          aspect={aspectRatio}
          circularCrop={round}
          keepSelection
          ruleOfThirds
          minWidth={24}
        >
          <canvas
            ref={canvas}
            role="img"
            aria-label={t`The picture you chose`}
            hidden={broken}
            className="max-h-[60dvh] max-w-full"
          />
        </ReactCrop>
      </div>
      {broken && (
        <p className="mt-3 text-sm text-fg-muted">
          <Trans>
            This picture cannot be shown here. You can still send it, and the
            server crops it around its centre.
          </Trans>
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="primary"
          disabled={!crop && !broken}
          onClick={() => onConfirm(crop && toRegion(crop))}
        >
          <Trans>Use this part</Trans>
        </Button>
        <Button variant="quiet" onClick={onCancel}>
          <Trans>Cancel</Trans>
        </Button>
      </div>
    </Dialog>
  );
}
