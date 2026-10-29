import { createContext, useContext } from "react";
import { DEFAULT_RATINGS } from "../data/content";

// Provided by App.
// ratings: the ratings in effect (Safe and Suggestive unless adult mode is on).
// storedRatings: the ratings chosen in adult mode, kept while it is off.
export const ContentContext = createContext({
  ratings: DEFAULT_RATINGS,
  storedRatings: DEFAULT_RATINGS,
  setRatings: () => {},
  adultMode: false,
  setAdultMode: () => {},
  adultConfirmed: false,
  confirmAdult: () => {},
});

export function useContentSettings() {
  return useContext(ContentContext);
}
