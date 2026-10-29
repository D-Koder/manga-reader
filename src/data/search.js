import { apiGet } from "./api";
import { DEFAULT_RATINGS } from "./content";

export const PAGE_SIZE = 24;

const EMPTY_PARAMS = {
  term: "",
  genres: [],
  status: "all",
  scan: "",
  authors: [],
};

// Parses a search segment such as
// "term=slime&genre=[a,b]&status=[ongoing]&scan=[id]&author=[id]".
export function parseSearchParams(raw) {
  const params = { ...EMPTY_PARAMS, genres: [], authors: [] };
  String(raw || "")
    .split("&")
    .forEach((part) => {
      const eq = part.indexOf("=");
      if (eq < 0) return;
      const key = part.slice(0, eq);
      const value = part.slice(eq + 1);
      const list = value
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (key === "term") params.term = value;
      else if (key === "genre") params.genres = list;
      else if (key === "status") params.status = list[0] || "all";
      else if (key === "scan") params.scan = list[0] || "";
      else if (key === "author") params.authors = list;
    });
  return params;
}

// Inverse of parseSearchParams. Returns a router path like "/search/...".
export function buildSearchPath({ term = "", genres = [], status = "all", scan = "", authors = [] }) {
  const parts = [];
  if (term) parts.push(`term=${encodeURIComponent(term)}`);
  if (genres.length > 0) parts.push(`genre=[${genres.join(",")}]`);
  parts.push(`status=[${status}]`);
  parts.push(`scan=[${scan}]`);
  parts.push(`author=[${authors.join(",")}]`);
  return `/search/${parts.join("&")}`;
}

// One page of results. Returns { items, total } so the caller can offer "Load more".
export async function searchManga(params, offset = 0, ratings = DEFAULT_RATINGS) {
  const query = new URLSearchParams();
  query.set("limit", String(PAGE_SIZE));
  query.set("offset", String(offset));
  query.set("order[followedCount]", "desc");
  query.append("includes[]", "cover_art");
  query.append("includes[]", "author");
  ratings.forEach((rating) => query.append("contentRating[]", rating));
  if (params.term) query.set("title", params.term);
  params.genres.forEach((id) => query.append("includedTags[]", id));
  if (params.status !== "all") query.append("status[]", params.status);
  if (params.scan) query.set("group", params.scan);
  params.authors.forEach((id) => query.append("authors[]", id));

  const data = await apiGet(`/manga?${query.toString()}`);
  return { items: data.data, total: data.total ?? data.data.length };
}
