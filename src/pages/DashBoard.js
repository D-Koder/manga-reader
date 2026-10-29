import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../data/api";
import { buildSearchPath } from "../data/search";
import { ratingParams } from "../data/content";
import { useContentSettings } from "../context/content";
import { MangaGrid, SkeletonGrid } from "../components/MangaCard";
import FilterPanel from "../components/FilterPanel";
import "../css/home.css";

// includes[]=cover_art returns each cover's fileName in the same response,
// so every card gets its image without a second request.
const latestUrl = (ratings) =>
  `/manga?limit=12&includes[]=cover_art&availableTranslatedLanguage[]=en&${ratingParams(ratings)}&order[latestUploadedChapter]=desc&hasAvailableChapters=true`;
const popularUrl = (ratings) =>
  `/manga?limit=12&includes[]=cover_art&${ratingParams(ratings)}&order[followedCount]=desc`;

const NO_FILTERS = { genres: [], status: "all", scan: "", authors: [] };

function useMangaList(url) {
  const [state, setState] = useState({ status: "loading", items: [], error: "" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading", items: [], error: "" });
    apiGet(url)
      .then((data) => {
        if (active) setState({ status: "ready", items: data.data, error: "" });
      })
      .catch((err) => {
        if (active) setState({ status: "error", items: [], error: err.message });
      });
    return () => {
      active = false;
    };
  }, [url]);

  return state;
}

function MangaSection({ title, list, subtitleFor }) {
  return (
    <section className="home-section">
      <div className="section-head">
        <h2>{title}</h2>
      </div>
      {list.status === "error" && <p className="inline-error">{list.error}</p>}
      {list.status === "loading" && <SkeletonGrid />}
      {list.status === "ready" && (
        <MangaGrid items={list.items} subtitleFor={subtitleFor} />
      )}
    </section>
  );
}

function DashBoard() {
  const navigate = useNavigate();
  const { ratings } = useContentSettings();
  // URLs are compared by value, so the lists only refetch when the ratings change.
  const latest = useMangaList(latestUrl(ratings));
  const popular = useMangaList(popularUrl(ratings));

  const applyFilters = (filters) => {
    navigate(buildSearchPath({ ...filters, term: "" }));
  };

  return (
    <>
      <div className="hero">
        <h1>Discover manga</h1>
        <p>Browse what's new, what's popular, or filter by genre.</p>
      </div>

      <FilterPanel initial={NO_FILTERS} onApply={applyFilters} />

      <MangaSection
        title="Latest uploads"
        list={latest}
        subtitleFor={(a) => `Ch. ${a.latestUploadedChapter || "?"}`}
      />
      <MangaSection
        title="Most followed"
        list={popular}
        subtitleFor={(a) => `Ch. ${a.lastChapter || "?"}`}
      />
    </>
  );
}

export default DashBoard;
