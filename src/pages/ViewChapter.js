import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../data/api";
import { chapterPath, flattenChapters, pickTitle } from "../data/manga";
import "../css/reader.css";

const QUALITY_KEY = "HighImageQuality";

function readHighQuality() {
  try {
    return JSON.parse(localStorage.getItem(QUALITY_KEY)) === true;
  } catch {
    return false;
  }
}

function ChapterNav({ mangaId, older, newer }) {
  return (
    <nav className="reader-nav" aria-label="Chapter navigation">
      {older ? (
        <Link className="ui-btn ui-btn-ghost" to={chapterPath(mangaId, older)}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      {newer ? (
        <Link className="ui-btn ui-btn-primary" to={chapterPath(mangaId, newer)}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function ViewChapter() {
  const { mangaId, chapterDetail } = useParams();
  const navigate = useNavigate();
  // Route format: "chapterId&volume&chapter", see chapterPath().
  const [chapterId, volumeNo, chapterNo] = chapterDetail.split("&");

  const [highQuality, setHighQuality] = useState(readHighQuality);
  const [pages, setPages] = useState({ status: "loading", urls: [], error: "" });
  const [info, setInfo] = useState({ mangaTitle: "", chapterTitle: "", chapters: [] });

  // Page images. Re-runs when the chapter or the quality setting changes.
  useEffect(() => {
    let active = true;
    setPages({ status: "loading", urls: [], error: "" });
    apiGet(`/at-home/server/${chapterId}`)
      .then((data) => {
        if (!active) return;
        const folder = highQuality ? "data" : "data-saver";
        const files = highQuality ? data.chapter.data : data.chapter.dataSaver;
        const urls = files.map(
          (file) => `${data.baseUrl}/${folder}/${data.chapter.hash}/${file}`
        );
        setPages({ status: "ready", urls, error: "" });
      })
      .catch((err) => {
        if (active) setPages({ status: "error", urls: [], error: err.message });
      });
    return () => {
      active = false;
    };
  }, [chapterId, highQuality]);

  // Titles and the chapter list used for previous/next. Failure here only hides extras.
  useEffect(() => {
    let active = true;
    Promise.all([
      apiGet(`/chapter/${chapterId}?includes[]=manga`),
      apiGet(`/manga/${mangaId}/aggregate?translatedLanguage[]=en`).catch(() => ({ volumes: {} })),
    ])
      .then(([chapterData, aggregate]) => {
        if (!active) return;
        const mangaRel = chapterData.data.relationships.find((rel) => rel.type === "manga");
        setInfo({
          mangaTitle: mangaRel?.attributes ? pickTitle(mangaRel.attributes) : "",
          chapterTitle: chapterData.data.attributes.title || "",
          externalUrl: chapterData.data.attributes.externalUrl || "",
          chapters: flattenChapters(aggregate),
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [chapterId, mangaId]);

  // The chapter list is newest first, so "newer" is the entry before this one.
  const index = info.chapters.findIndex((c) => c.id === chapterId);
  const newer = index > 0 ? info.chapters[index - 1] : null;
  const older = index >= 0 && index < info.chapters.length - 1 ? info.chapters[index + 1] : null;

  // Arrow keys move between chapters, unless the user is typing in a field.
  useEffect(() => {
    const onKey = (event) => {
      if (event.target.closest?.("input, textarea, select")) return;
      if (event.key === "ArrowLeft" && older) navigate(chapterPath(mangaId, older));
      if (event.key === "ArrowRight" && newer) navigate(chapterPath(mangaId, newer));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [older, newer, mangaId, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [chapterId]);

  const toggleQuality = () => {
    const next = !highQuality;
    setHighQuality(next);
    try {
      localStorage.setItem(QUALITY_KEY, JSON.stringify(next));
    } catch {
      // Not critical: the choice just won't persist.
    }
  };

  const title = info.chapterTitle || `Chapter ${chapterNo || "—"}`;

  return (
    <>
      <header className="reader-head">
        <Link to={`/ViewManga/${mangaId}`} className="back-link">
          ← {info.mangaTitle || "Back to manga"}
        </Link>
        <h1>{title}</h1>
        <p className="muted">
          Chapter {chapterNo || "—"}
          {volumeNo && volumeNo !== "none" && ` · Volume ${volumeNo}`}
          {pages.status === "ready" && ` · ${pages.urls.length} pages`}
        </p>
        <div className="reader-controls">
          <button
            type="button"
            className="chip"
            aria-pressed={highQuality}
            onClick={toggleQuality}
          >
            High quality
          </button>
          <span className="muted reader-hint">
            Off uses smaller images, which load faster.
          </span>
        </div>
      </header>

      <ChapterNav mangaId={mangaId} older={older} newer={newer} />

      {pages.status === "loading" && (
        <div className="reader-pages" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="page-skeleton skeleton" />
          ))}
        </div>
      )}

      {pages.status === "error" && <p className="inline-error">{pages.error}</p>}

      {pages.status === "ready" && pages.urls.length === 0 && (
        <div className="empty-state">
          <h2>Not hosted here</h2>
          <p className="muted">
            This chapter is published on another site, so there are no pages to show.
          </p>
          {info.externalUrl && (
            <a
              className="ui-btn ui-btn-primary"
              href={info.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read on the publisher's site
            </a>
          )}
        </div>
      )}

      {pages.status === "ready" && pages.urls.length > 0 && (
        <div className="reader-pages">
          {pages.urls.map((url, i) => (
            <img key={url} src={url} alt={`Page ${i + 1}`} loading="lazy" />
          ))}
        </div>
      )}

      <ChapterNav mangaId={mangaId} older={older} newer={newer} />

      <p className="muted reader-hint reader-foot">
        Tip: use the ← and → arrow keys to change chapter.
      </p>
    </>
  );
}

export default ViewChapter;
