import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildSearchPath, parseSearchParams, searchManga } from "../data/search";
import { MangaGrid, SkeletonGrid } from "../components/MangaCard";
import FilterPanel from "../components/FilterPanel";
import { useContentSettings } from "../context/content";
import "../css/home.css";

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

function AdvancedSearch() {
  const { searchQuery } = useParams();
  const navigate = useNavigate();
  const params = useMemo(() => parseSearchParams(searchQuery), [searchQuery]);
  const { ratings } = useContentSettings();

  const [state, setState] = useState({ status: "loading", items: [], total: 0, error: "" });
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState("");

  // Re-run the search whenever the URL changes.
  useEffect(() => {
    let active = true;
    setState({ status: "loading", items: [], total: 0, error: "" });
    setMoreError("");
    searchManga(params, 0, ratings)
      .then(({ items, total }) => {
        if (active) setState({ status: "ready", items, total, error: "" });
      })
      .catch((err) => {
        if (active) setState({ status: "error", items: [], total: 0, error: err.message });
      });
    return () => {
      active = false;
    };
  }, [params, ratings]);

  const loadMore = async () => {
    setLoadingMore(true);
    setMoreError("");
    try {
      const { items, total } = await searchManga(params, state.items.length, ratings);
      setState((prev) => ({ ...prev, items: [...prev.items, ...items], total }));
    } catch (err) {
      setMoreError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const applyFilters = (filters) => {
    navigate(buildSearchPath({ ...filters, term: params.term }));
  };

  const remaining = state.total - state.items.length;
  const heading = params.term ? `Results for “${params.term}”` : "Browse manga";

  return (
    <>
      <div className="results-head">
        <h1>{heading}</h1>
        {state.status === "ready" && (
          <p className="muted">
            {state.total} {state.total === 1 ? "title" : "titles"}
          </p>
        )}
      </div>

      <details className="filter-disclosure" open>
        <summary>Filters</summary>
        {/* Keyed by URL so the panel resets when a new search starts. */}
        <FilterPanel key={searchQuery} initial={params} onApply={applyFilters} />
      </details>

      {state.status === "error" && <p className="inline-error">{state.error}</p>}
      {state.status === "loading" && <SkeletonGrid />}

      {state.status === "ready" && state.items.length === 0 && (
        <div className="empty-state">
          <h2>No manga found</h2>
          <p className="muted">Try a different title or clear some filters.</p>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => navigate("/")}
          >
            Back to home
          </button>
        </div>
      )}

      {state.status === "ready" && state.items.length > 0 && (
        <MangaGrid
          items={state.items}
          subtitleFor={(a) =>
            [capitalize(a.status), a.latestUploadedChapter && `Ch. ${a.latestUploadedChapter}`]
              .filter(Boolean)
              .join(" · ")
          }
        />
      )}

      {state.status === "ready" && remaining > 0 && (
        <div className="load-more">
          {moreError && <p className="inline-error">{moreError}</p>}
          <button
            type="button"
            className="ui-btn ui-btn-ghost"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : `Load more (${remaining} left)`}
          </button>
        </div>
      )}
    </>
  );
}

export default AdvancedSearch;
