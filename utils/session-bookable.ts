// Whether a free slot can be booked by a guest. Time comparisons take `now`
// as a parameter rather than reading it internally, so callers can pass
// EventContext's `now` — seeded from the server-rendered value to avoid an
// SSR/hydration mismatch, then ticked forward on the client — instead of a
// fresh client-side `new Date()`.
export function isBookableSlot(params: {
  locationBookable: boolean;
  startTime: number;
  now: number;
  startBookings?: number;
  endBookings?: number;
}): boolean {
  const { locationBookable, startTime, now, startBookings, endBookings } =
    params;
  return (
    locationBookable &&
    startTime > now &&
    (startBookings === undefined || startTime >= startBookings) &&
    (endBookings === undefined || startTime < endBookings)
  );
}
