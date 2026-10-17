import type { snapshotLocationSchema } from "@schellingboard/contracts/snapshot";
import type { Location } from "@schellingboard/domain/location";
import type { z } from "zod";

export function toLocationView(
  l: Location
): z.input<typeof snapshotLocationSchema> {
  return {
    id: l.id,
    name: l.name,
    description: l.description,
    areaDescription: l.areaDescription ?? null,
    capacity: l.capacity,
    color: l.color,
    bookable: l.bookable,
    imageUrl: l.imageUrl,
    sortIndex: l.sortIndex,
    version: l.version,
  };
}
