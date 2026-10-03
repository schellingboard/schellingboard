// Whether a free slot can be booked by a guest.
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
