export type SiteSettings = {
  title: string;
  description: string;
  mapImageUrl: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  title: "Example Conference Weekend",
  description: "Welcome! Browse the schedules for each event below.",
  mapImageUrl: "",
};
