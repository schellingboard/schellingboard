import { useEffect, useRef } from "react";

/** A canvas, not an <img> with a blob: URL, which CodeQL flags as XSS through DOM. */
export function ImagePreview({
  file,
  label,
  width,
  height,
  className,
}: {
  file: Blob;
  label: string;
  width: number;
  height: number;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof createImageBitmap !== "function") return;
    let stale = false;
    createImageBitmap(file).then(
      (bitmap) => {
        const target = canvas.current;
        if (!stale && target)
          target
            .getContext("2d")
            ?.drawImage(bitmap, 0, 0, target.width, target.height);
        bitmap.close();
      },
      () => {}
    );
    return () => {
      stale = true;
    };
  }, [file]);

  return (
    <canvas
      ref={canvas}
      role="img"
      aria-label={label}
      // Twice the shown size, for sharp pixels on high-density screens.
      width={width * 2}
      height={height * 2}
      style={{ width, height }}
      className={className}
    />
  );
}
