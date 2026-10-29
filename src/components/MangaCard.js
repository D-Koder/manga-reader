import React from "react";
import { Link } from "react-router-dom";
import { coverUrl, pickTitle } from "../data/manga";

export function MangaCard({ manga, subtitle }) {
  const title = pickTitle(manga.attributes);
  const cover = coverUrl(manga);
  return (
    <Link to={`/ViewManga/${manga.id}`} className="manga-card">
      <div className="manga-cover">
        {cover && <img src={cover} alt="" loading="lazy" />}
      </div>
      <div className="manga-title" title={title}>
        {title}
      </div>
      {subtitle && <div className="manga-sub">{subtitle}</div>}
    </Link>
  );
}

export function MangaGrid({ items, subtitleFor }) {
  return (
    <div className="card-grid">
      {items.map((manga) => (
        <MangaCard
          key={manga.id}
          manga={manga}
          subtitle={subtitleFor ? subtitleFor(manga.attributes) : undefined}
        />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="manga-card skeleton" aria-hidden="true">
          <div className="manga-cover" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
