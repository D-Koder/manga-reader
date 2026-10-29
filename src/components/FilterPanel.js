import React, { useEffect, useState } from "react";
import { getGenres } from "../data/genres";
import { AUTHORS, SCAN_GROUPS, STATUS_OPTIONS } from "../data/filters";
import { CONTENT_RATINGS } from "../data/content";
import { useContentSettings } from "../context/content";

// Shared by the home page and the search results page.
// `initial` is { genres, status, scan, authors }; `onApply` receives the same shape.
function FilterPanel({ initial, onApply }) {
  const [genres, setGenres] = useState([]); // [name, id] pairs
  const [genreError, setGenreError] = useState("");
  const [selectedGenres, setSelectedGenres] = useState(initial.genres);
  const [status, setStatus] = useState(initial.status);
  const [scan, setScan] = useState(initial.scan);
  const [selectedAuthors, setSelectedAuthors] = useState(initial.authors);
  const [authorPick, setAuthorPick] = useState("");
  const { ratings, setRatings, adultMode } = useContentSettings();

  // Each rating is a filter: selected ones are shown. At least one must stay selected.
  const toggleRating = (id) => {
    if (ratings.includes(id)) {
      if (ratings.length > 1) setRatings(ratings.filter((r) => r !== id));
    } else {
      setRatings([...ratings, id]);
    }
  };

  useEffect(() => {
    let active = true;
    getGenres()
      .then((list) => {
        if (active) setGenres(list);
      })
      .catch((err) => {
        if (active) setGenreError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggleGenre = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const addAuthor = (id) => {
    if (id && !selectedAuthors.includes(id)) {
      setSelectedAuthors([...selectedAuthors, id]);
    }
    setAuthorPick("");
  };

  const removeAuthor = (id) => {
    setSelectedAuthors(selectedAuthors.filter((a) => a !== id));
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setStatus("all");
    setScan("");
    setSelectedAuthors([]);
    setAuthorPick("");
  };

  const submit = (event) => {
    event.preventDefault();
    onApply({ genres: selectedGenres, status, scan, authors: selectedAuthors });
  };

  const authorName = (id) => AUTHORS.find(([aid]) => aid === id)?.[1] ?? id;

  return (
    <form className="filter-card" onSubmit={submit}>
      <p className="panel-title">Filters</p>

      {adultMode && (
        <>
          <span className="field-label">Content rating</span>
          <div className="chips" role="group" aria-label="Content rating">
            {CONTENT_RATINGS.map(({ id, label }) => (
              <button
                type="button"
                key={id}
                className="chip"
                aria-pressed={ratings.includes(id)}
                onClick={() => toggleRating(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      <span className="field-label" style={{ marginTop: adultMode ? 14 : 0 }}>Genres</span>
      <div className="chips" role="group" aria-label="Genres">
        {genres.length === 0 && !genreError && (
          <span className="manga-sub">Loading genres…</span>
        )}
        {genreError && <p className="inline-error">{genreError}</p>}
        {genres.map(([name, id]) => (
          <button
            type="button"
            key={id}
            className="chip"
            aria-pressed={selectedGenres.includes(id)}
            onClick={() => toggleGenre(id)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="filter-grid">
        <div>
          <label className="field-label" htmlFor="status-select">
            Status
          </label>
          <select
            id="status-select"
            className="field-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="scan-select">
            Scan group
          </label>
          <select
            id="scan-select"
            className="field-control"
            value={scan}
            onChange={(e) => setScan(e.target.value)}
          >
            <option value="">Any scan group</option>
            {SCAN_GROUPS.map(([id, name]) => (
              <option key={id} value={id}>
                {name.trim()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="author-select">
            Add author
          </label>
          <select
            id="author-select"
            className="field-control"
            value={authorPick}
            onChange={(e) => addAuthor(e.target.value)}
          >
            <option value="">Choose an author…</option>
            {AUTHORS.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          {selectedAuthors.length > 0 && (
            <div className="chips" style={{ marginTop: 8 }}>
              {selectedAuthors.map((id) => (
                <button
                  type="button"
                  key={id}
                  className="chip"
                  aria-pressed="true"
                  onClick={() => removeAuthor(id)}
                  aria-label={`Remove ${authorName(id)}`}
                >
                  {authorName(id)} <span className="chip-remove">×</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="filter-actions">
        <button type="button" className="ui-btn ui-btn-ghost" onClick={clearFilters}>
          Clear
        </button>
        <button type="submit" className="ui-btn ui-btn-primary">
          Apply filters
        </button>
      </div>
    </form>
  );
}

export default FilterPanel;
