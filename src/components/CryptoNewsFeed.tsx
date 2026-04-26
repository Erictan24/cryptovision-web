"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink } from "lucide-react";
import { useLang } from "./LanguageProvider";

type NewsItem = {
  id: string;
  title: string;
  body: string;
  image: string;
  url: string;
  source: string;
  source_img: string;
  published_at: number;
  categories: string[];
};

function timeAgo(unixSec: number, locale: "id" | "en"): string {
  const diff = Math.floor(Date.now() / 1000 - unixSec);
  if (diff < 60) return locale === "id" ? `${diff}d lalu` : `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return locale === "id" ? `${m}m lalu` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return locale === "id" ? `${h} jam lalu` : `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return locale === "id" ? `${d} hari lalu` : `${d}d ago`;
  return new Date(unixSec * 1000).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
  });
}

export default function CryptoNewsFeed() {
  const { locale } = useLang();
  const [items, setItems] = useState<NewsItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/crypto-news", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setItems(d.items || []);
        else setError(true);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === "id" ? "Gagal memuat berita." : "Failed to load news."}
        </p>
      </div>
    );
  }

  if (!items) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
          {locale === "id" ? "Memuat berita..." : "Loading news..."}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === "id" ? "Belum ada berita." : "No news yet."}
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Newspaper size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Berita Crypto Terbaru" : "Latest Crypto News"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "— update tiap 10 menit" : "— refresh every 10 min"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((n) => (
          <a
            key={n.id}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] transition-all hover:border-[var(--color-accent)]/60 hover:shadow-md hover:shadow-[var(--color-accent)]/10"
          >
            {/* Thumbnail */}
            {n.image ? (
              <div className="relative aspect-video w-full overflow-hidden bg-[var(--color-bg-primary)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={n.image}
                  alt={n.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-[var(--color-bg-primary)]">
                <Newspaper size={32} className="text-[var(--color-text-muted)]" />
              </div>
            )}

            <div className="flex flex-1 flex-col p-4">
              {/* Source + time */}
              <div className="mb-2 flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                <div className="flex items-center gap-1.5 min-w-0">
                  {n.source_img && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={n.source_img} alt="" className="h-3.5 w-3.5 rounded-full" />
                  )}
                  <span className="font-semibold uppercase tracking-wide truncate">{n.source}</span>
                </div>
                <span className="shrink-0">{timeAgo(n.published_at, locale)}</span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold leading-snug text-[var(--color-text-primary)] line-clamp-2 group-hover:text-[var(--color-accent-light)]">
                {n.title}
              </h3>

              {/* Body excerpt */}
              {n.body && (
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)] line-clamp-3">
                  {n.body}
                </p>
              )}

              {/* Categories + read link */}
              <div className="mt-auto flex items-end justify-between pt-3">
                <div className="flex flex-wrap gap-1">
                  {n.categories.slice(0, 2).map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--color-accent-light)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-light)]">
                  {locale === "id" ? "Baca" : "Read"} <ExternalLink size={10} />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
