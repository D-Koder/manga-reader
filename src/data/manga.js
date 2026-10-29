// Helpers for reading MangaDex manga objects returned with includes[].

export function pickTitle(attributes) {
  const titles = attributes.title || {};
  return titles.en || Object.values(titles)[0] || "Untitled";
}

export function coverUrl(manga) {
  const cover = manga.relationships?.find((rel) => rel.type === "cover_art");
  const fileName = cover?.attributes?.fileName;
  return fileName
    ? `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.256.jpg`
    : "";
}

export function authorName(manga) {
  const author = manga.relationships?.find((rel) => rel.type === "author");
  return author?.attributes?.name || "";
}

// Flattens a /manga/{id}/aggregate response into one list, newest chapter first.
export function flattenChapters(data) {
  const list = [];
  Object.values(data.volumes || {}).forEach((volume) => {
    Object.values(volume.chapters || {}).forEach((chapter) => {
      if (!chapter.id) return;
      list.push({
        id: chapter.id,
        volume: volume.volume ?? "none",
        chapter: chapter.chapter ?? "",
      });
    });
  });
  return list.sort((a, b) => (Number(b.chapter) || 0) - (Number(a.chapter) || 0));
}

// Router path for a chapter. The reader splits the last segment into id, volume and chapter.
export function chapterPath(mangaId, chapter) {
  return `/ViewManga/${mangaId}/ViewChapter/${chapter.id}&${chapter.volume}&${chapter.chapter}`;
}

// Names of tags in one group, e.g. "genre" or "theme".
export function tagNames(manga, group) {
  return Object.values(manga.attributes.tags || {})
    .filter((tag) => tag.attributes.group === group)
    .map((tag) => tag.attributes.name.en)
    .filter(Boolean);
}
