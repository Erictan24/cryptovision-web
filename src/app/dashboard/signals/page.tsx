"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, TrendingUp, TrendingDown, Check, Lock, Crown } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

type Signal = {
  id: number;
  symbol: string;
  direction: string;
  strategy: string;
  quality: string;
  score: number;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  rr: number;
  reasons: string[];
  executed: boolean;
  created_at: string;
};

function fmtPrice(n: number): string {
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toFixed(6);
}

function timeAgo(iso: string, locale: "id" | "en"): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return locale === "id" ? "baru saja" : "just now";
  if (sec < 3600) return locale === "id" ? `${Math.floor(sec / 60)}m lalu` : `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return locale === "id" ? `${Math.floor(sec / 3600)}j lalu` : `${Math.floor(sec / 3600)}h ago`;
  return locale === "id" ? `${Math.floor(sec / 86400)}h lalu` : `${Math.floor(sec / 86400)}d ago`;
}

export default function SignalsPage() {
  const { locale } = useLang();
  const [signals, setSignals] = useState<Signal[] | null>(null);
  const [error, setError] = useState(false);
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  useEffect(() => {
    // Check subscription status
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => setIsPaid(!!d.subscription))
      .catch(() => setIsPaid(false));

    const load = () =>
      fetch(`/api/signals?limit=50&status=pending&t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) setSignals(d.signals || []);
          else setError(true);
        })
        .catch(() => setError(true));
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  // Free user: hanya 3 signal terbaru, value entry/SL/TP/reasons di-mask
  const visibleSignals = isPaid === false && signals
    ? signals.slice(0, 3)
    : signals;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={22} className="text-[var(--color-accent)]" />
            {locale === "id" ? "Sinyal Trading" : "Trading Signals"}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {isPaid === false
              ? locale === "id"
                ? "Preview 3 sinyal terakhir — upgrade untuk akses penuh real-time"
                : "Preview last 3 signals — upgrade for full real-time access"
              : locale === "id"
              ? "Sinyal aktif (LIMIT pending) — refresh tiap 30 detik"
              : "Active signals (LIMIT pending) — refresh every 30s"}
          </p>
        </div>
        {isPaid && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)]/15 px-3 py-1 text-xs font-bold text-[var(--color-accent-light)]">
            <Crown size={12} /> {locale === "id" ? "Akses Penuh" : "Full Access"}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "id" ? "Gagal memuat sinyal." : "Failed to load signals."}
          </p>
        </div>
      )}

      {!error && signals === null && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            {locale === "id" ? "Memuat..." : "Loading..."}
          </div>
        </div>
      )}

      {!error && signals !== null && signals.length === 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "id"
              ? "Belum ada sinyal. Bot scan tiap 30 menit (swing) dan 15 menit (scalp)."
              : "No signals yet. Bot scans every 30min (swing) and 15min (scalp)."}
          </p>
        </div>
      )}

      {!error && visibleSignals && visibleSignals.length > 0 && (
        <div className="space-y-2">
          {visibleSignals.map((s) => {
            const isLong = s.direction === "LONG";
            const dirColor = isLong ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
            const dirBg = isLong ? "bg-[var(--color-success)]/10" : "bg-[var(--color-danger)]/10";
            const masked = isPaid === false;
            return (
              <div
                key={s.id}
                className={`card-glow rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 ${masked ? "relative" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${dirBg} ${dirColor}`}>
                      {isLong ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base">{s.symbol}</span>
                        <span className={`text-xs font-bold ${dirColor}`}>{s.direction}</span>
                        <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent)] uppercase">
                          {s.strategy}
                        </span>
                        <span className="rounded-full bg-[var(--color-bg-primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-secondary)]">
                          {s.quality}
                        </span>
                        {s.executed && (
                          <span className="flex items-center gap-0.5 rounded-full bg-[var(--color-success)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--color-success)]">
                            <Check size={9} /> Auto Trade
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                        {timeAgo(s.created_at, locale)} · Score {s.score} · RR 1:{(+s.rr || 0).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${masked ? "blur-sm select-none" : ""}`}>
                  <div>
                    <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Entry</div>
                    <div className="font-semibold">{masked ? "•••••" : fmtPrice(+s.entry)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[var(--color-text-muted)]">SL</div>
                    <div className="font-semibold text-[var(--color-danger)]">{masked ? "•••••" : fmtPrice(+s.sl)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[var(--color-text-muted)]">TP1</div>
                    <div className="font-semibold text-[var(--color-success)]">{masked ? "•••••" : fmtPrice(+s.tp1)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-[var(--color-text-muted)]">TP2</div>
                    <div className="font-semibold text-[var(--color-success)]">{masked ? "•••••" : fmtPrice(+s.tp2)}</div>
                  </div>
                </div>

                {Array.isArray(s.reasons) && s.reasons.length > 0 && !masked && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)]/40">
                    <div className="text-[10px] uppercase text-[var(--color-text-muted)] mb-1">
                      {locale === "id" ? "Alasan Sinyal" : "Signal Reasons"}
                    </div>
                    <ul className="space-y-0.5 text-xs text-[var(--color-text-secondary)]">
                      {s.reasons.slice(0, 4).map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[var(--color-accent)]">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {/* Upgrade CTA — for free users */}
          {isPaid === false && signals && signals.length > 0 && (
            <div className="mt-6 rounded-2xl border-2 border-dashed border-[var(--color-accent)]/40 bg-[var(--color-bg-card)] p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent)]/15">
                <Lock size={24} className="text-[var(--color-accent)]" />
              </div>
              <h3 className="text-lg font-bold">
                {locale === "id" ? "Unlock semua sinyal real-time" : "Unlock all real-time signals"}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {locale === "id"
                  ? `Sekarang ada ${signals.length} sinyal aktif yang ke-blur. Upgrade untuk lihat entry/SL/TP lengkap + notif Telegram langsung.`
                  : `${signals.length} active signals are blurred. Upgrade to see full entry/SL/TP + direct Telegram alerts.`}
              </p>
              <Link
                href="/#pricing"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-light)]"
              >
                <Crown size={14} /> {locale === "id" ? "Lihat Paket" : "View Plans"}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
