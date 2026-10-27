import { cx } from "./cx";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const SIZES = {
  lg: "h-28 w-28 text-3xl",
  md: "h-16 w-16 text-lg",
  sm: "h-12 w-12 text-sm",
};

/** The guest's photo, or their initials when they have none. */
export function Avatar({
  name,
  image,
  size = "lg",
  className,
}: {
  name: string;
  image?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        SIZES[size],
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-tint-hover font-semibold text-brand-fg",
        className
      )}
    >
      {image ? (
        <img
          className="h-full w-full object-cover"
          src={image}
          alt={`Profile avatar of ${name}`}
        />
      ) : (
        initials(name) || "?"
      )}
    </div>
  );
}
