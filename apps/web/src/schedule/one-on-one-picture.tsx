export function OneOnOnePicture() {
  return (
    <img
      src="/one-on-one.webp"
      alt="Two attendees in conversation"
      // Taller than a room photo's 4:3 on purpose: this column is capped
      // narrower than a room, and the height is what levels them.
      className="aspect-[7/8] w-full object-cover"
      width={525}
      height={600}
    />
  );
}
