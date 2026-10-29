import baseUrl from "./connection";

// GET a MangaDex endpoint and return its JSON body.
// Throws an Error with a readable message so pages can show it to the user.
export async function apiGet(path) {
  const response = await fetch(baseUrl + path);
  if (response.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}).`);
  }
  return response.json();
}
