import type { VenueDeps } from "../ports";
import {
  assignLocationsToEvent,
  removeLocationsFromEvent,
} from "./event-locations";
import {
  createLocation,
  deleteLocation,
  listLocations,
  moveLocation,
  removeLocationImage,
  replaceLocationImage,
  updateLocation,
} from "./locations";

export function createVenueUseCases(deps: VenueDeps) {
  return {
    listLocations: listLocations(deps),
    createLocation: createLocation(deps),
    updateLocation: updateLocation(deps),
    deleteLocation: deleteLocation(deps),
    moveLocation: moveLocation(deps),
    replaceLocationImage: replaceLocationImage(deps),
    removeLocationImage: removeLocationImage(deps),
    assignLocationsToEvent: assignLocationsToEvent(deps),
    removeLocationsFromEvent: removeLocationsFromEvent(deps),
  };
}

export type VenueUseCases = ReturnType<typeof createVenueUseCases>;
