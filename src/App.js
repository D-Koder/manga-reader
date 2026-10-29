import "./css/App.css";
import "./css/theme.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ViewChapter from "./pages/ViewChapter";
import ViewManga from "./pages/ViewManga-agregate";
import DashBoard from "./pages/DashBoard";
import NavBar from "./pages/NavBar";
import NewApi from "./pages/NewAPI";
import AdvancedSearch from "./pages/AdvancedSearch";
import { getGenres } from "./data/genres";
import {
  ALL_RATINGS,
  DEFAULT_RATINGS,
  readAdultConfirmed,
  readAdultMode,
  readRatings,
  saveAdultConfirmed,
  saveAdultMode,
  saveRatings,
} from "./data/content";
import { ContentContext } from "./context/content";
import { isSignedIn, setSignedIn } from "./data/auth";
import LoginScreen from "./components/LoginScreen";

function getInitialDark() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
  } catch {
    // Storage blocked: fall back to the OS setting.
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function App() {
  const [mangaId, setMangaId] = useState("");
  const [dark, setDark] = useState(getInitialDark);
  const [signedIn, setSignedInState] = useState(isSignedIn);
  const [storedRatings, setStoredRatings] = useState(readRatings);
  const [adultMode, setAdultModeState] = useState(readAdultMode);
  const [adultConfirmed, setAdultConfirmed] = useState(readAdultConfirmed);

  // Never leave the list empty: an empty filter would fall back to all ratings.
  const setRatings = (list) => {
    const next = list.length > 0 ? list : DEFAULT_RATINGS;
    setStoredRatings(next);
    saveRatings(next);
  };

  // Show 18+ reveals the rating filter with every rating selected.
  // Hide 18+ removes the filter and goes back to Safe and Suggestive.
  const setAdultMode = (on) => {
    setAdultModeState(on);
    saveAdultMode(on);
    if (on) setRatings(ALL_RATINGS);
  };

  const confirmAdult = () => {
    setAdultConfirmed(true);
    saveAdultConfirmed();
  };

  const ratings = adultMode ? storedRatings : DEFAULT_RATINGS;

  // Theme: apply it to <html> so the CSS variables switch, and remember it.
  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Not critical: the theme just won't persist.
    }
  }, [dark]);

  // AdvancedSearch reads genres from localStorage, so load them up front.
  useEffect(() => {
    getGenres().catch(() => {});
  }, []);

  if (!signedIn) {
    return <LoginScreen onSignedIn={() => setSignedInState(true)} />;
  }

  return (
    <BrowserRouter>
      <ContentContext.Provider
        value={{ ratings, storedRatings, setRatings, adultMode, setAdultMode, adultConfirmed, confirmAdult }}
      >
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
        crossOrigin="anonymous"
      />
      <NavBar
        dark={dark}
        onToggleTheme={() => setDark((d) => !d)}
        onSignOut={() => {
          setSignedIn(false);
          setSignedInState(false);
        }}
      />
      <main className="page">
        <Routes>
          <Route path="/" element={<DashBoard />} />
          <Route
            path="/NewApi/:mangaId/ViewChapter/:chapterID"
            element={<NewApi />}
          />
          <Route
            path="/ViewManga/:mangaId/ViewChapter/:chapterDetail"
            element={<ViewChapter />}
          />
          <Route path="/search/:searchQuery" element={<AdvancedSearch />} />
          <Route
            path="/ViewManga/:mangaId/"
            element={<ViewManga mangaId={[mangaId, setMangaId]} />}
          />
        </Routes>
      </main>
      </ContentContext.Provider>
    </BrowserRouter>
  );
}

export default App;
