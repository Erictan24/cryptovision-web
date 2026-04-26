"use client";

import { useEffect, useState } from "react";
import { Newspaper, AlertTriangle, Clock } from "lucide-react";
import { useLang } from "./LanguageProvider";

type NewsEvent = {
  title: string;
  country: string;
  date: string;
  impact: "High" | "Medium" | "Low";
  forecast?: string;
  previous?: string;
  isCritical: boolean;
  minutesUntil: number;
};

const COUNTRY_FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
  AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", NZD: "🇳🇿", CNY: "🇨🇳",
};

function formatCountdown(mins: number, locale: "id" | "en"): string {
  if (mins < 60) return locale === "id" ? `${mins}m lagi` : `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) {
    return locale === "id"
      ? `${hours}j ${rem}m lagi`
      : `in ${hours}h ${rem}m`;
  }
  const days = Math.floor(hours / 24);
  return locale === "id" ? `${days}h lagi` : `in ${days}d`;
}

function formatDate(iso: string, locale: "id" | "en"): string {
  const d = new Date(iso);
  const loc = locale === "id" ? "id-ID" : "en-US";
  return d.toLocaleString(loc, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsSection() {
  const { locale } = useLang();
  const [events, setEvents] = useState<NewsEvent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Cache-bust di client agar tidak ambil dari browser cache
    fetch(`/api/news?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => setError(true));
  }, []);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Newspaper size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Berita Ekonomi — 7 Hari Ke Depan" : "Economic News — Next 7 Days"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id"
            ? "— bot block trade saat news High impact"
            : "— bot blocks trades during High impact news"}
        </span>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        {error && (
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "id"
              ? "Gagal memuat kalender. Coba refresh nanti."
              : "Failed to load calendar. Try refresh later."}
          </p>
        )}

        {!error && events === null && (
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            {locale === "id" ? "Memuat kalender..." : "Loading calendar..."}
          </div>
        )}

        {!error && events !== null && events.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "id"
              ? "Tidak ada event High/Medium impact dalam minggu ini."
              : "No High/Medium impact events this week."}
          </p>
        )}

        {!error && events && events.length > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {events.map((ev, i) => {
              const imminent = ev.minutesUntil >= 0 && ev.minutesUntil <= 120;
              const impactClass =
                ev.impact === "High"
                  ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                  : "bg-[var(--color-warning,#f59e0b)]/15 text-[var(--color-warning,#f59e0b)]";
              const flag = COUNTRY_FLAG[ev.country] || "🌐";
              return (
                <li key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-shrink-0 text-xl pt-0.5">{flag}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{ev.title}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${impactClass}`}>
                        {ev.impact}
                      </span>
                      {ev.isCritical && (
                        <span className="flex items-center gap-0.5 rounded bg-[var(--color-accent)]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--color-accent)]">
                          <AlertTriangle size={10} /> Crypto
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
                      <span>{formatDate(ev.date, locale)}</span>
                      <span className={`flex items-center gap-1 ${imminent ? "font-semibold text-[var(--color-danger)]" : ""}`}>
                        <Clock size={11} />
                        {formatCountdown(ev.minutesUntil, locale)}
                      </span>
                      {ev.forecast && (
                        <span>
                          {locale === "id" ? "Perkiraan" : "Forecast"}: <b>{ev.forecast}</b>
                        </span>
                      )}
                      {ev.previous && (
                        <span>
                          {locale === "id" ? "Sebelum" : "Prev"}: {ev.previous}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
