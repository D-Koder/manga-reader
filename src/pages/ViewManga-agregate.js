import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../data/api";
import { buildSearchPath } from "../data/search";
import { authorName, coverUrl, flattenChapters, pickTitle } from "../data/manga";
import { isAdultRating } from "../data/content";
import { useContentSettings } from "../context/content";
import "../css/manga.css";

// MangaDex descriptions are markdown with trailers and links below a "---" line.
function synopsisParagraphs(text) {
  return String(text || "")
    .split(/\n\s*---\s*\n/)[0]
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function useMangaPage(mangaId) {
  const [state, setState] = useState({
    status: "loading",
    manga: null,
    stats: null,
    chapters: [],
    chaptersError: "",
    error: "",
  });

  useEffect(() => {
    let active = true;
    setState({ status: "loading", manga: null, stats: null, chapters: [], chaptersError: "", error: "" });

    const detail = apiGet(`/manga/${mangaId}?includes[]=cover_art&includes[]=author`);
    // Stats and chapters are secondary: the page still works if they fail.
    const stats = apiGet(`/statistics/manga/${mangaId}`).catch(() => null);
    const chapters = apiGet(`/manga/${mangaId}/aggregate?translatedLanguage[]=en`)
      .then((data) => ({ list: flattenChapters(data), error: "" }))
      .catch((err) => ({ list: [], error: err.message }));

    Promise.all([detail, stats, chapters])
      .then(([detailData, statData, chapterResult]) => {
        if (!active) return;
        const statistics = statData ? Object.values(statData.statistics || {})[0] : null;
        setState({
          status: "ready",
          manga: detailData.data,
          stats: statistics,
          chapters: chapterResult.list,
          chaptersError: chapterResult.error,
          error: "",
        });
      })
      .catch((err) => {
        if (active) setState((prev) => ({ ...prev, status: "error", error: err.message }));
      });

    return () => {
      active = false;
    };
  }, [mangaId]);

  return state;
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function ViewManga() {
  const { mangaId } = useParams();
  const { ratings } = useContentSettings();
  const page = useMangaPage(mangaId);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  const visibleChapters = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    const matches = needle
      ? page.chapters.filter((c) => `${c.chapter} ${c.volume}`.toLowerCase().includes(needle))
      : page.chapters;
    return newestFirst ? matches : [...matches].reverse();
  }, [page.chapters, filter, newestFirst]);

  if (page.status === "loading") {
    return (
      <div className="manga-hero skeleton" aria-busy="true">
        <div className="manga-poster skeleton-block" />
        <div className="manga-info">
          <div className="skeleton-line" style={{ width: "60%", height: 26 }} />
          <div className="skeleton-line" style={{ width: "40%" }} />
          <div className="skeleton-line" style={{ width: "90%" }} />
        </div>
      </div>
    );
  }

  if (page.status === "error" || !page.manga) {
    return (
      <div className="empty-state">
        <h2>Couldn't load this manga</h2>
        <p className="muted">{page.error}</p>
        <Link to="/" className="ui-btn ui-btn-primary">Back to home</Link>
      </div>
    );
  }

  const contentRating = page.manga.attributes.contentRating;
  if (isAdultRating(contentRating) && !ratings.includes(contentRating)) {
    return (
      <div className="empty-state">
        <h2>This title is {contentRating}</h2>
        <p className="muted">Select {contentRating} in the content rating filter to view it.</p>
        <Link to="/" className="ui-btn ui-btn-primary">Back to home</Link>
      </div>
    );
  }

  const { manga, stats, chapters } = page;
  const attributes = manga.attributes;
  const title = pickTitle(attributes);
  const altTitle = (attributes.altTitles || []).map((t) => t.en).find(Boolean);
  const cover = coverUrl(manga);
  const author = authorName(manga);
  const tags = Object.values(attributes.tags || {});
  const genres = tags.filter((t) => t.attributes.group === "genre");
  const themes = tags.filter((t) => t.attributes.group === "theme");
  const paragraphs = synopsisParagraphs(attributes.description?.en);
  const rating = stats?.rating?.bayesian ? (Number(stats.rating.bayesian) / 2).toFixed(1) : null;
  const follows = stats?.follows != null ? Number(stats.follows).toLocaleString() : null;
  const chapterLink = (c) => `/ViewManga/${manga.id}/ViewChapter/${c.id}&${c.volume}&${c.chapter}`;
  const firstChapter = chapters[chapters.length - 1];
  const latestChapter = chapters[0];

  return (
    <>
      <Link to="/" className="back-link">← Back</Link>

      <div className="manga-hero">
        <div className="manga-poster">
          {cover && <img src={cover} alt={`Cover of ${title}`} />}
        </div>

        <div className="manga-info">
          <h1>{title}</h1>
          {altTitle && altTitle !== title && <p className="manga-alt">{altTitle}</p>}

          <div className="stats-row">
            {author && <Stat label="Author" value={author} />}
            {attributes.status && (
              <Stat label="Status" value={attributes.status.charAt(0).toUpperCase() + attributes.status.slice(1)} />
            )}
            {attributes.year && <Stat label="Year" value={attributes.year} />}
            {rating && <Stat label="Rating" value={`${rating} / 5`} />}
            {follows && <Stat label="Follows" value={follows} />}
          </div>

          <div className="action-row">
            {latestChapter && (
              <Link to={chapterLink(latestChapter)} className="ui-btn ui-btn-primary">
                Read latest
              </Link>
            )}
            {firstChapter && latestChapter !== firstChapter && (
              <Link to={chapterLink(firstChapter)} className="ui-btn ui-btn-ghost">
                Start from chapter 1
              </Link>
            )}
          </div>

          {(genres.length > 0 || themes.length > 0) && (
            <div className="chips">
              {genres.map((tag) => (
                <Link
                  key={tag.id}
                  to={buildSearchPath({ genres: [tag.id] })}
                  className="chip"
                >
                  {tag.attributes.name.en}
                </Link>
              ))}
              {themes.map((tag) => (
                <span key={tag.id} className="chip chip-muted">
                  {tag.attributes.name.en}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {paragraphs.length > 0 && (
        <section className="section">
          <h2>Synopsis</h2>
          <div className={`synopsis ${expanded ? "" : "synopsis-collapsed"}`}>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {paragraphs.join("").length > 280 && (
            <button type="button" className="text-btn" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Chapters <span className="muted">({chapters.length})</span></h2>
        </div>

        {page.chaptersError && <p className="inline-error">{page.chaptersError}</p>}

        {chapters.length > 0 && (
          <>
            <div className="chapter-toolbar">
              <input
                type="search"
                className="field-control"
                placeholder="Filter by chapter or volume…"
                aria-label="Filter chapters"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <button
                type="button"
                className="ui-btn ui-btn-ghost"
                onClick={() => setNewestFirst((v) => !v)}
              >
                {newestFirst ? "Newest first" : "Oldest first"}
              </button>
            </div>

            {visibleChapters.length === 0 ? (
              <p className="muted">No chapters match “{filter}”.</p>
            ) : (
              <ol className="chapter-list">
                {visibleChapters.map((c) => (
                  <li key={c.id}>
                    <Link to={chapterLink(c)} className="chapter-row">
                      <span>Chapter {c.chapter || "—"}</span>
                      {c.volume !== "none" && <span className="muted">Vol. {c.volume}</span>}
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        {chapters.length === 0 && !page.chaptersError && (
          <p className="muted">No English chapters yet.</p>
        )}
      </section>
    </>
  );
}

export default ViewManga;
