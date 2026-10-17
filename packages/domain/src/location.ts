export type Location = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  capacity: number;
  color: string;
  bookable: boolean;
  sortIndex: number;
  areaDescription?: string;
  version: number;
};

export type LocationUnavailability = {
  id: string;
  eventId: string;
  locationId: string;
  start: Date;
  end: Date;
};
