"use client";

import { useEffect, useState } from "react";
import { Newspaper, AlertTriangle, ChevronDown, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useLang } from "./LanguageProvider";

type NewsEvent = {
  title: string;
  country: string;
  date: string;
  impact: "High" | "Medium" | "Low";
  forecast?: string;
  previous?: string;
  actual?: string;
  isCritical: boolean;
  minutesUntil: number;
  hasReleased: boolean;
  scenario?: {
    bullish: string;
    bearish: string;
    explainer: string;
  };
};

const COUNTRY_FLAG: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵",
  AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", NZD: "🇳🇿", CNY: "🇨🇳",
};

function formatTime(iso: string, locale: "id" | "en"): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(locale === "id" ? "id-ID" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateHeader(iso: string, locale: "id" | "en"): string {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatCountdown(mins: number, locale: "id" | "en"): string {
  if (mins < 0) {
    const past = Math.abs(mins);
    if (past < 60) return locale === "id" ? `${past}m lalu` : `${past}m ago`;
    const h = Math.floor(past / 60);
    return locale === "id" ? `${h}j lalu` : `${h}h ago`;
  }
  if (mins < 60) return locale === "id" ? `${mins}m lagi` : `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hours < 24) {
    return locale === "id" ? `${hours}j ${rem}m` : `${hours}h ${rem}m`;
  }
  const days = Math.floor(hours / 24);
  return locale === "id" ? `${days}h lagi` : `in ${days}d`;
}

// Compare actual vs forecast — return color hint
function compareActual(actual?: string, forecast?: string): "better" | "worse" | "neutral" {
  if (!actual || !forecast) return "neutral";
  const a = parseFloat(actual.replace(/[^0-9.\-]/g, ""));
  const f = parseFloat(forecast.replace(/[^0-9.\-]/g, ""));
  if (isNaN(a) || isNaN(f)) return "neutral";
  if (a > f) return "better"; // depends on event but generally higher
  if (a < f) return "worse";
  return "neutral";
}

function ImpactBars({ impact }: { impact: "High" | "Medium" | "Low" }) {
  const fillCount = impact === "High" ? 3 : impact === "Medium" ? 2 : 1;
  const color =
    impact === "High" ? "bg-[var(--color-danger)]" :
    impact === "Medium" ? "bg-[var(--color-warning,#f59e0b)]" :
    "bg-[var(--color-text-muted)]";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`h-3 w-1 rounded-sm ${i <= fillCount ? color : "bg-[var(--color-border)]"}`}
        />
      ))}
    </div>
  );
}

export default function NewsSection() {
  const { locale } = useLang();
  const [events, setEvents] = useState<NewsEvent[] | null>(null);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/news?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => setError(true));
  }, []);

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Group events by day
  const grouped: Record<string, NewsEvent[]> = {};
  events?.forEach((ev) => {
    const k = dayKey(ev.date);
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push(ev);
  });
  const dayKeys = Object.keys(grouped);

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Newspaper size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Kalender Ekonomi" : "Economic Calendar"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "— 7 hari ke depan, klik untuk skenario" : "— next 7 days, click for scenario"}
        </span>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
        {error && (
          <div className="p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              {locale === "id" ? "Gagal memuat kalender." : "Failed to load calendar."}
            </p>
          </div>
        )}

        {!error && events === null && (
          <div className="p-5">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
              {locale === "id" ? "Memuat kalender..." : "Loading calendar..."}
            </div>
          </div>
        )}

        {!error && events !== null && events.length === 0 && (
          <div className="p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              {locale === "id" ? "Tidak ada event minggu ini." : "No events this week."}
            </p>
          </div>
        )}

        {dayKeys.map((dk) => {
          const dayEvents = grouped[dk];
          const dateStr = formatDateHeader(dayEvents[0].date, locale);
          return (
            <div key={dk}>
              {/* Day header */}
              <div className="bg-[var(--color-bg-primary)] px-4 py-2.5 border-b border-[var(--color-border)]">
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)]">
                  {dateStr}
                </h3>
              </div>

              {/* Events */}
              {dayEvents.map((ev, i) => {
                const key = `${ev.date}-${ev.title}-${i}`;
                const isExpanded = expanded.has(key);
                const isPast = ev.hasReleased;
                const flag = COUNTRY_FLAG[ev.country] || "🌐";
                const cmp = compareActual(ev.actual, ev.forecast);
                const actualColor =
                  cmp === "better" ? "text-[var(--color-success)]" :
                  cmp === "worse" ? "text-[var(--color-danger)]" :
                  "text-[var(--color-text-secondary)]";

                return (
                  <div
                    key={key}
                    className={`border-b border-[var(--color-border)] last:border-0 transition-colors ${
                      isPast ? "opacity-60" : ""
                    } ${ev.scenario ? "cursor-pointer hover:bg-[var(--color-bg-primary)]/40" : ""}`}
                    onClick={() => ev.scenario && toggleExpand(key)}
                  >
                    {/* Main row */}
                    <div className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-sm">
                      {/* Time */}
                      <div className="col-span-2 sm:col-span-1 font-mono text-xs text-[var(--color-text-secondary)]">
                        {formatTime(ev.date, locale)}
                      </div>

                      {/* Flag + Impact */}
                      <div className="col-span-1 flex items-center gap-1">
                        <span className="text-lg">{flag}</span>
                      </div>

                      {/* Impact bars */}
                      <div className="col-span-1">
                        <ImpactBars impact={ev.impact} />
                      </div>

                      {/* Title + tags */}
                      <div className="col-span-8 sm:col-span-5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-medium truncate">{ev.title}</span>
                          {ev.isCritical && (
                            <span className="flex items-center gap-0.5 rounded bg-[var(--color-accent)]/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-[var(--color-accent)]">
                              <AlertTriangle size={9} /> Crypto
                            </span>
                          )}
                          {!isPast && (
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              {formatCountdown(ev.minutesUntil, locale)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actual / Forecast / Prev */}
                      <div className="col-span-12 sm:col-span-4 mt-1 sm:mt-0 flex items-center justify-end gap-3 text-xs">
                        <div className="text-right">
                          <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Actual</div>
                          <div className={`font-bold ${actualColor}`}>{ev.actual || "—"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Forecast</div>
                          <div className="font-medium">{ev.forecast || "—"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] text-[var(--color-text-muted)] uppercase">Prior</div>
                          <div className="text-[var(--color-text-muted)]">{ev.previous || "—"}</div>
                        </div>
                        {ev.scenario && (
                          <ChevronDown
                            size={14}
                            className={`text-[var(--color-text-muted)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Expanded scenario */}
                    {isExpanded && ev.scenario && (
                      <div className="bg-[var(--color-bg-primary)]/40 border-t border-[var(--color-border)] px-4 py-4">
                        <div className="mb-3 flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                          <Info size={14} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
                          <p>{ev.scenario.explainer}</p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                              <TrendingUp size={12} className="text-[var(--color-success)]" />
                              <span className="text-[10px] font-bold uppercase text-[var(--color-success)]">
                                {locale === "id" ? "Skenario Bullish" : "Bullish Scenario"}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)]">{ev.scenario.bullish}</p>
                          </div>
                          <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3">
                            <div className="mb-1 flex items-center gap-1.5">
                              <TrendingDown size={12} className="text-[var(--color-danger)]" />
                              <span className="text-[10px] font-bold uppercase text-[var(--color-danger)]">
                                {locale === "id" ? "Skenario Bearish" : "Bearish Scenario"}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-text-secondary)]">{ev.scenario.bearish}</p>
                          </div>
                        </div>
                        {isPast && ev.actual && (
                          <div className="mt-3 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] p-3">
                            <div className="mb-1 text-[10px] font-bold uppercase text-[var(--color-text-muted)]">
                              {locale === "id" ? "Hasil Aktual" : "Actual Result"}
                            </div>
                            <div className="text-sm">
                              <span className="text-[var(--color-text-muted)]">Actual: </span>
                              <span className={`font-bold ${actualColor}`}>{ev.actual}</span>
                              <span className="text-[var(--color-text-muted)]"> vs Forecast {ev.forecast || "—"}</span>
                              {cmp !== "neutral" && (
                                <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
                                  {cmp === "better"
                                    ? (locale === "id" ? "→ Lebih tinggi dari ekspektasi" : "→ Higher than expected")
                                    : (locale === "id" ? "→ Lebih rendah dari ekspektasi" : "→ Lower than expected")}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
