// In development, requests go through the dev server proxy in src/setupProxy.js.
// The live site calls MangaDex directly.
const baseUrl =
  process.env.NODE_ENV === "development" ? "/api" : "https://api.mangadex.org";
export default baseUrl;
