import { apiGet } from "./api";

const STORAGE_KEY = "genres";

// Shared promise so the home page, navbar and search page never fire
// the same request twice at the same time.
let genrePromise = null;

async function loadGenres() {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (Array.isArray(cached) && cached.length > 0) return cached;
  } catch {
    // Corrupt cache entry: fall through and fetch again.
  }

  const data = await apiGet("/manga/tag");
  // Stored as [name, id] pairs, the shape AdvancedSearch reads from localStorage.
  const genres = data.data
    .filter((tag) => tag.attributes.group === "genre")
    .map((tag) => [
      tag.attributes.name.en ?? Object.values(tag.attributes.name)[0],
      tag.id,
    ]);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(genres));
  } catch {
    // Storage full or blocked: genres still work for this visit.
  }
  return genres;
}

export function getGenres() {
  if (!genrePromise) {
    genrePromise = loadGenres().catch((err) => {
      genrePromise = null; // allow a retry after a failure
      throw err;
    });
  }
  return genrePromise;
}
