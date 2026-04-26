"use client";

import { useEffect, useState } from "react";
import { Briefcase, TrendingUp, TrendingDown, CheckCircle2, Shield } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

type Position = {
  id: number;
  signal_id: number | null;
  symbol: string;
  direction: string;
  strategy: string;
  quality: string | null;
  entry: number | null;
  sl: number | null;
  tp1: number | null;
  tp2: number | null;
  rr: number | null;
  qty: number | null;
  reasons: string[] | null;
  tp1_hit: boolean;
  bep_active: boolean;
  opened_at: string;
};

function fmtPrice(n: number | null): string {
  if (n === null || n === undefined) return "—";
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toFixed(6);
}

function timeAgo(iso: string, locale: "id" | "en"): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return locale === "id" ? "baru saja" : "just now";
  if (sec < 3600) return locale === "id" ? `${Math.floor(sec / 60)}m lalu` : `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return locale === "id" ? `${Math.floor(sec / 3600)}j lalu` : `${Math.floor(sec / 3600)}h ago`;
  return locale === "id" ? `${Math.floor(sec / 86400)}h lalu` : `${Math.floor(sec / 86400)}d ago`;
}

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

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Briefcase size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Posisi Terbuka" : "Open Positions"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "— refresh tiap 15 detik" : "— refresh every 15s"}
        </span>
      </div>

      {error && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "id" ? "Gagal memuat posisi." : "Failed to load positions."}
          </p>
        </div>
      )}

      {!error && positions === null && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            {locale === "id" ? "Memuat posisi..." : "Loading positions..."}
          </div>
        </div>
      )}

      {!error && positions !== null && positions.length === 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
          <Briefcase size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            {locale === "id" ? "Belum ada posisi terbuka." : "No open positions."}
          </p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {locale === "id"
              ? "Posisi muncul di sini saat limit order ter-fill dan trade lagi running."
              : "Positions appear here when limit orders fill and trades are running."}
          </p>
        </div>
      )}

      {!error && positions && positions.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {positions.map((p) => {
            const isLong = p.direction.toUpperCase().includes("LONG") || p.direction.toUpperCase() === "BUY";
            const dirIcon = isLong ? TrendingUp : TrendingDown;
            const DirIcon = dirIcon;
            const dirColor = isLong ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
            const dirBg    = isLong ? "bg-[var(--color-success)]/10" : "bg-[var(--color-danger)]/10";

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 transition hover:border-[var(--color-accent)]/50"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${dirBg}`}>
                      <DirIcon size={16} className={dirColor} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold">{p.symbol}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${dirBg} ${dirColor}`}>
                          {p.direction}
                        </span>
                      </div>
                      <div className="text-[10px] uppercase text-[var(--color-text-muted)]">
                        {p.strategy} · {timeAgo(p.opened_at, locale)}
                      </div>
                    </div>
                  </div>

                  {/* Stage badges */}
                  <div className="flex flex-col items-end gap-1">
                    {p.tp1_hit && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--color-success)]/15 px-2 py-0.5 text-[9px] font-bold text-[var(--color-success)]">
                        <CheckCircle2 size={9} /> TP1
                      </span>
                    )}
                    {p.bep_active && (
                      <span className="flex items-center gap-1 rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[9px] font-bold text-[var(--color-accent-light)]">
                        <Shield size={9} /> BEP
                      </span>
                    )}
                  </div>
                </div>

                {/* Levels grid */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <div className="text-[9px] uppercase text-[var(--color-text-muted)]">Entry</div>
                    <div className="font-mono font-semibold">{fmtPrice(p.entry)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-[var(--color-text-muted)]">SL</div>
                    <div className="font-mono font-semibold text-[var(--color-danger)]">{fmtPrice(p.sl)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-[var(--color-text-muted)]">TP1</div>
                    <div className="font-mono font-semibold text-[var(--color-success)]">{fmtPrice(p.tp1)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase text-[var(--color-text-muted)]">TP2</div>
                    <div className="font-mono font-semibold text-[var(--color-success)]">{fmtPrice(p.tp2)}</div>
                  </div>
                </div>

                {/* Footer: RR + qty */}
                <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-[11px] text-[var(--color-text-muted)]">
                  <span>RR <span className="font-bold text-[var(--color-text-secondary)]">{p.rr ? p.rr.toFixed(2) : "—"}</span></span>
                  {p.qty !== null && p.qty !== undefined && (
                    <span>Qty <span className="font-bold text-[var(--color-text-secondary)]">{p.qty}</span></span>
                  )}
                  {p.quality && (
                    <span className="rounded bg-[var(--color-bg-primary)] px-1.5 py-0.5 font-semibold uppercase">
                      {p.quality}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
