import { initials } from "../../ui/avatar";

/**
 * Widest the profile shows a photo, in CSS pixels: a face is recognised at this
 * size outright, so enlarging is only for looking closely.
 */
const PHOTO_SIZE = 256;
const ZOOM_SIZE = 512;

/**
 * Square rather than round like the list's avatar: a circle discards the
 * corners of the stored square crop, which eats hair and shoulders at this size.
 * Enlarging swaps the size in place, not a second dialog over the profile's.
 */
export function ProfilePhoto({
  name,
  image,
  zoomed,
  onToggleZoom,
}: {
  name: string;
  image: string | null;
  zoomed: boolean;
  onToggleZoom: () => void;
}) {
  const size = zoomed ? ZOOM_SIZE : PHOTO_SIZE;
  // aria-hidden: the name is the heading right below, and the button carries
  // its own label.
  const photo = (
    <div
      aria-hidden="true"
      style={{ maxWidth: size }}
      className="w-full aspect-square overflow-hidden rounded-2xl bg-brand-tint-hover text-brand-fg text-6xl font-semibold flex items-center justify-center"
    >
      {image ? (
        <img
          className="w-full h-full object-cover"
          src={image}
          alt={`Profile avatar of ${name}`}
          width={ZOOM_SIZE}
          height={ZOOM_SIZE}
        />
      ) : (
        initials(name) || "?"
      )}
    </div>
  );
  if (!image) return photo;
  return (
    <button
      type="button"
      aria-label={`${zoomed ? "Shrink" : "Enlarge"} photo of ${name}`}
      aria-pressed={zoomed}
      style={{ maxWidth: size }}
      className="w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      onClick={onToggleZoom}
    >
      {photo}
    </button>
  );
}
