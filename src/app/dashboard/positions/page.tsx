"use client";

import { useEffect, useState } from "react";
import { Briefcase, TrendingUp, TrendingDown, CheckCircle2, Shield, Zap } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

type Position = {
  id: number | string;
  signal_id: number | string | null;
  symbol: string;
  direction: string;
  strategy: string;
  quality: string | null;
  entry: number | string | null;
  sl: number | string | null;
  tp1: number | string | null;
  tp2: number | string | null;
  rr: number | string | null;
  qty: number | string | null;
  leverage: number | string | null;
  reasons: string[] | null;
  tp1_hit: boolean;
  bep_active: boolean;
  opened_at: string;
};

const DEFAULT_LEVERAGE = 10; // fallback kalau leverage tidak di-push dari bot

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────
function toNum(n: unknown): number | null {
  if (n === null || n === undefined || n === "") return null;
  const num = typeof n === "number" ? n : parseFloat(String(n));
  return isFinite(num) ? num : null;
}

function fmtPrice(n: unknown): string {
  const num = toNum(n);
  if (num === null) return "—";
  if (num >= 1) return num.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return num.toFixed(6);
}

function fmtRr(n: unknown): string {
  const num = toNum(n);
  return num === null ? "—" : `1:${num.toFixed(2)}`;
}

function fmtPct(n: number, withSign = true): string {
  const sign = withSign && n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function timeAgo(iso: string, locale: "id" | "en"): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return locale === "id" ? "baru saja" : "just now";
  if (sec < 3600) return locale === "id" ? `${Math.floor(sec / 60)}m lalu` : `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return locale === "id" ? `${Math.floor(sec / 3600)}j lalu` : `${Math.floor(sec / 3600)}h ago`;
  return locale === "id" ? `${Math.floor(sec / 86400)}h lalu` : `${Math.floor(sec / 86400)}d ago`;
}

// ─────────────────────────────────────────────────
// Live price hook (Bitunix REST polling — match exchange yang ditrading)
// ─────────────────────────────────────────────────
function useBitunixPrices(): Map<string, number> {
  const [prices, setPrices] = useState<Map<string, number>>(() => new Map());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch(`/api/bitunix-prices?t=${Date.now()}`, { cache: "no-store" });
        const d = await r.json();
        if (cancelled || !d.ok || !d.prices) return;
        const next = new Map<string, number>();
        for (const [sym, info] of Object.entries(d.prices as Record<string, { price: number }>)) {
          if (typeof info?.price === "number") next.set(sym, info.price);
        }
        setPrices(next);
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 3_000); // poll 3 detik
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return prices;
}

// ─────────────────────────────────────────────────
// Position metrics calc
// ─────────────────────────────────────────────────
function calcMetrics(p: Position, currentPrice: number | null) {
  const entry = toNum(p.entry);
  const sl    = toNum(p.sl);
  const tp1   = toNum(p.tp1);
  const tp2   = toNum(p.tp2);

  if (!entry) return null;

  const isLong = p.direction.toUpperCase().includes("LONG") || p.direction.toUpperCase() === "BUY";

  // PnL % (spot, sebelum leverage)
  const lev = toNum(p.leverage) ?? DEFAULT_LEVERAGE;
  let pnlPct: number | null = null;
  let roiPct: number | null = null;
  if (currentPrice !== null) {
    pnlPct = isLong
      ? ((currentPrice - entry) / entry) * 100
      : ((entry - currentPrice) / entry) * 100;
    roiPct = pnlPct * lev;
  }

  // Progress to TP1/TP2 — 0 to 1 scale
  const progressTo = (target: number | null): number => {
    if (target === null || currentPrice === null) return 0;
    const totalDist = Math.abs(target - entry);
    if (totalDist === 0) return 0;
    const movedDist = isLong
      ? Math.max(0, currentPrice - entry)
      : Math.max(0, entry - currentPrice);
    return Math.min(1, movedDist / totalDist);
  };
  const tp1Progress = tp1 ? progressTo(tp1) : 0;
  const tp2Progress = tp2 ? progressTo(tp2) : 0;

  // Distance to SL (negative if past SL)
  const slDistPct = sl !== null && currentPrice !== null
    ? Math.abs(sl - currentPrice) / entry * 100
    : null;

  return {
    entry, sl, tp1, tp2,
    isLong,
    currentPrice,
    pnlPct, roiPct, leverage: lev,
    tp1Progress, tp2Progress,
    slDistPct,
  };
}

// ─────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────
export default function PositionsPage() {
  const { locale } = useLang();
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = () =>
      fetch(`/api/positions?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) setPositions(d.positions || []);
          else setError(true);
        })
        .catch(() => setError(true));
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, []);

  // Bitunix prices match exact exchange position — pakai ini bukan Binance
  const live = useBitunixPrices();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Briefcase size={20} className="text-[var(--color-accent)]" />
        <h2 className="text-xl font-bold">
          {locale === "id" ? "Posisi Terbuka" : "Open Positions"}
        </h2>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-[var(--color-success)]/15 px-2 py-0.5 text-[9px] font-bold text-[var(--color-success)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-success)] opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-success)]"></span>
          </span>
          LIVE
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "— harga Bitunix (match exchange)" : "— Bitunix prices (match exchange)"}
        </span>
      </div>

      {error && (
        <ErrorState locale={locale} />
      )}

      {!error && positions === null && (
        <LoadingState locale={locale} />
      )}

      {!error && positions !== null && positions.length === 0 && (
        <EmptyState locale={locale} />
      )}

      {!error && positions && positions.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {positions.map((p) => (
            <PositionCard
              key={p.id}
              p={p}
              currentPrice={live.get(p.symbol) ?? null}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Card component
// ─────────────────────────────────────────────────
function PositionCard({ p, currentPrice, locale }: {
  p: Position;
  currentPrice: number | null;
  locale: "id" | "en";
}) {
  const m = calcMetrics(p, currentPrice);
  if (!m) return null;

  const dirColor = m.isLong ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
  const dirGrad  = m.isLong
    ? "from-[var(--color-success)]/10 via-transparent to-transparent"
    : "from-[var(--color-danger)]/10 via-transparent to-transparent";
  const dirBg = m.isLong ? "bg-[var(--color-success)]/15" : "bg-[var(--color-danger)]/15";
  const DirIcon = m.isLong ? TrendingUp : TrendingDown;

  const pnlIsUp = (m.pnlPct ?? 0) >= 0;
  const pnlColor = pnlIsUp ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
  const pnlBg    = pnlIsUp ? "bg-[var(--color-success)]/10" : "bg-[var(--color-danger)]/10";

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br ${dirGrad} bg-[var(--color-bg-card)] p-5 transition hover:border-[var(--color-accent)]/40 hover:shadow-lg hover:shadow-[var(--color-accent)]/5`}>
      {/* Subtle background glow */}
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full ${dirBg} blur-3xl opacity-50 pointer-events-none`} />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${dirBg} ring-1 ring-inset ring-white/5`}>
            <DirIcon size={22} className={dirColor} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight">{p.symbol}</h3>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${dirBg} ${dirColor}`}>
                {p.direction}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
              <span className="font-semibold uppercase tracking-wider">{p.strategy}</span>
              <span>·</span>
              <span>{timeAgo(p.opened_at, locale)}</span>
              {p.quality && (
                <>
                  <span>·</span>
                  <span className="rounded bg-[var(--color-bg-primary)] px-1.5 py-0.5 font-bold text-[var(--color-text-secondary)]">
                    {p.quality}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stage badges */}
        <div className="flex flex-col items-end gap-1.5">
          {p.tp1_hit && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-success)]/15 px-2 py-0.5 text-[9px] font-bold text-[var(--color-success)]">
              <CheckCircle2 size={10} /> TP1
            </span>
          )}
          {p.bep_active && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[9px] font-bold text-[var(--color-accent-light)]">
              <Shield size={10} /> BEP LOCK
            </span>
          )}
        </div>
      </div>

      {/* Live price + PnL hero */}
      <div className="relative mt-5 rounded-xl bg-[var(--color-bg-primary)]/50 p-4 ring-1 ring-inset ring-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">
              <Zap size={10} className="text-[var(--color-accent)]" />
              {locale === "id" ? "Harga Live" : "Live Price"}
            </div>
            <div className="mt-0.5 font-mono text-2xl font-bold tabular-nums">
              {currentPrice !== null ? fmtPrice(currentPrice) : "—"}
            </div>
          </div>

          {m.pnlPct !== null && m.roiPct !== null ? (
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)]">
                ROI ({m.leverage}x)
              </div>
              <div className={`text-2xl font-bold tabular-nums ${pnlColor}`}>
                {fmtPct(m.roiPct)}
              </div>
              <div className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${pnlBg} ${pnlColor}`}>
                {pnlIsUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {fmtPct(m.pnlPct)} {locale === "id" ? "spot" : "spot"}
              </div>
            </div>
          ) : (
            <div className="text-right text-[10px] text-[var(--color-text-muted)]">
              {locale === "id" ? "Live price tidak tersedia" : "Live price unavailable"}
            </div>
          )}
        </div>
      </div>

      {/* Progress bars */}
      {currentPrice !== null && (
        <div className="relative mt-4 space-y-2.5">
          <ProgressBar
            label={locale === "id" ? "Menuju TP1" : "Toward TP1"}
            progress={m.tp1Progress}
            color="success"
            target={fmtPrice(m.tp1)}
          />
          <ProgressBar
            label={locale === "id" ? "Menuju TP2" : "Toward TP2"}
            progress={m.tp2Progress}
            color="success"
            target={fmtPrice(m.tp2)}
          />
        </div>
      )}

      {/* Levels — clean inline */}
      <div className="relative mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <LevelRow label="Entry" value={fmtPrice(m.entry)} color="text-[var(--color-text-primary)]" />
        <LevelRow label="SL" value={fmtPrice(m.sl)} color="text-[var(--color-danger)]" />
        <LevelRow label="TP1" value={fmtPrice(m.tp1)} color="text-[var(--color-success)]" />
        <LevelRow label="TP2" value={fmtPrice(m.tp2)} color="text-[var(--color-success)]" />
      </div>

      {/* Footer */}
      <div className="relative mt-4 flex items-center justify-between border-t border-[var(--color-border)]/60 pt-3 text-[11px] text-[var(--color-text-muted)]">
        <div className="flex items-center gap-3">
          <span>RR <span className="font-bold text-[var(--color-text-secondary)]">{fmtRr(p.rr)}</span></span>
          {p.qty !== null && p.qty !== undefined && (
            <span>Qty <span className="font-bold text-[var(--color-text-secondary)]">{String(p.qty)}</span></span>
          )}
        </div>
        {m.slDistPct !== null && (
          <span className="text-[var(--color-text-muted)]">
            SL {(m.slDistPct).toFixed(2)}% {locale === "id" ? "jauh" : "away"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────
function ProgressBar({ label, progress, color, target }: {
  label: string;
  progress: number;
  color: "success" | "danger";
  target: string;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const barColor = color === "success" ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]";
  const textColor = color === "success" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
        <span>{label} <span className="font-mono text-[var(--color-text-secondary)]">{target}</span></span>
        <span className={`font-bold tabular-nums ${textColor}`}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-primary)]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LevelRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
      <span className={`font-mono text-xs font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

function ErrorState({ locale }: { locale: "id" | "en" }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <p className="text-sm text-[var(--color-text-muted)]">
        {locale === "id" ? "Gagal memuat posisi." : "Failed to load positions."}
      </p>
    </div>
  );
}

function LoadingState({ locale }: { locale: "id" | "en" }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
        {locale === "id" ? "Memuat posisi..." : "Loading positions..."}
      </div>
    </div>
  );
}

function EmptyState({ locale }: { locale: "id" | "en" }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-10 text-center">
      <Briefcase size={36} className="mx-auto mb-4 text-[var(--color-text-muted)]" />
      <p className="text-base font-semibold text-[var(--color-text-secondary)]">
        {locale === "id" ? "Belum ada posisi terbuka" : "No open positions"}
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        {locale === "id"
          ? "Posisi muncul saat limit order ter-fill dan trade lagi running."
          : "Positions appear when limit orders fill and trades start running."}
      </p>
    </div>
  );
}
