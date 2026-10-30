// Constraints for location images, shared by the server and the forms.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MIN_IMAGE_WIDTH = 400;
export const REQUIRED_ASPECT_RATIO = 4 / 3;
export const ASPECT_RATIO_TOLERANCE = 0.02;

export const IMAGE_REQUIREMENTS_HINT =
  "JPEG, PNG, or WebP, max 5 MB, at least 400px wide, 4:3 aspect ratio (e.g. 800×600)";
