import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../data/api";
import { ratingParams } from "../data/content";
import { useContentSettings } from "../context/content";
import AccountMenu from "../components/AccountMenu";

function NavBar({ dark, onToggleTheme, onSignOut }) {
  const [query, setQuery] = useState("");
  const [rolling, setRolling] = useState(false);
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();
  const { ratings } = useContentSettings();

  const submitSearch = (event) => {
    event.preventDefault();
    // "&" and "/" would break the search URL format, so swap them for spaces.
    const term = query.replace(/[&/]/g, " ").trim();
    if (!term) return;
    navigate(`/search/term=${encodeURIComponent(term)}`);
    setQuery("");
  };

  const openRandom = async () => {
    setRolling(true);
    setNotice("");
    try {
      const data = await apiGet(`/manga/random?${ratingParams(ratings)}`);
      navigate(`/ViewManga/${data.data.id}`);
    } catch (err) {
      setNotice(err.message);
    } finally {
      setRolling(false);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-dot" aria-hidden="true" />
          Manga Reader
        </Link>

        <form className="topbar-search" role="search" onSubmit={submitSearch}>
          <input
            type="search"
            className="search-input"
            placeholder="Search manga…"
            aria-label="Search manga"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>

        <div className="topbar-actions">
          <AccountMenu onSignOut={onSignOut} />
          <button
            type="button"
            className="ui-btn ui-btn-ghost"
            onClick={openRandom}
            disabled={rolling}
          >
            {rolling ? "Rolling…" : "Random"}
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-icon"
            onClick={onToggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {notice && (
        <div className="topbar-notice" role="alert">
          {notice}
        </div>
      )}
    </header>
  );
}

export default NavBar;
