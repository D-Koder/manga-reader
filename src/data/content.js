// Content rating settings. Ratings are MangaDex's own. Adult ones (erotica,
// pornographic) need an age confirmation before they can be selected.
// The choices are saved in this browser only. This is not age verification.

const RATINGS_KEY = "contentRatings";
const CONFIRM_KEY = "adultConfirmed";

export const CONTENT_RATINGS = [
  { id: "safe", label: "Safe" },
  { id: "suggestive", label: "Suggestive" },
  { id: "erotica", label: "Erotica" },
  { id: "pornographic", label: "Pornographic" },
];

export const DEFAULT_RATINGS = ["safe", "suggestive"];
export const ADULT_RATINGS = ["erotica", "pornographic"];
export const ALL_RATINGS = ["safe", "suggestive", "erotica", "pornographic"];

const ADULT_MODE_KEY = "adultMode";

// Whether the rating filter is shown at all. Turned on with "Show 18+".
export function readAdultMode() {
  try {
    return localStorage.getItem(ADULT_MODE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveAdultMode(on) {
  try {
    localStorage.setItem(ADULT_MODE_KEY, String(on));
  } catch {
    // Not critical: the viewer will need to turn it on again next visit.
  }
}

export function isAdultRating(rating) {
  return ADULT_RATINGS.includes(rating);
}

// Query-string fragment such as "contentRating[]=safe&contentRating[]=suggestive".
export function ratingParams(ratings) {
  return ratings.map((rating) => `contentRating[]=${rating}`).join("&");
}

export function readRatings() {
  try {
    const saved = JSON.parse(localStorage.getItem(RATINGS_KEY));
    if (Array.isArray(saved)) {
      const valid = saved.filter((r) => CONTENT_RATINGS.some((c) => c.id === r));
      if (valid.length > 0) return valid;
    }
  } catch {
    // Corrupt value: fall back to the defaults.
  }
  return DEFAULT_RATINGS;
}

export function saveRatings(ratings) {
  try {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  } catch {
    // Not critical: the choice just won't persist.
  }
}

export function readAdultConfirmed() {
  try {
    return localStorage.getItem(CONFIRM_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveAdultConfirmed() {
  try {
    localStorage.setItem(CONFIRM_KEY, "true");
  } catch {
    // Not critical: the viewer will be asked again next visit.
  }
}
