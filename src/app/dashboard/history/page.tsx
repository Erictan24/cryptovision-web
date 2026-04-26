"use client";

import { useEffect, useState } from "react";
import { History, TrendingUp, TrendingDown } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

type Trade = {
  id: number;
  symbol: string;
  direction: string;
  strategy: string;
  quality: string;
  entry: number;
  exit_price: number;
  pnl_usd: number;
  pnl_r: number;
  outcome: string;
  bep_done: boolean;
  closed_at: string;
};

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${n.toFixed(2)}`;
}

function dateStr(iso: string, locale: "id" | "en"): string {
  return new Date(iso).toLocaleString(locale === "id" ? "id-ID" : "en-US", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { locale } = useLang();
  const [trades, setTrades] = useState<Trade[] | null>(null);

  useEffect(() => {
    fetch(`/api/trades?limit=100&t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setTrades(d.trades || []))
      .catch(() => setTrades([]));
  }, []);

  // Stats
  const total = trades?.length || 0;
  const wins = trades?.filter((t) => +t.pnl_usd > 0).length || 0;
  const losses = trades?.filter((t) => +t.pnl_usd < 0).length || 0;
  const beps = trades?.filter((t) => +t.pnl_usd === 0).length || 0;
  const wr = total > 0 ? (wins / total) * 100 : 0;
  const totalPnl = trades?.reduce((s, t) => s + (+t.pnl_usd || 0), 0) || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History size={22} className="text-[var(--color-accent)]" />
          {locale === "id" ? "Riwayat Trade" : "Trade History"}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {locale === "id" ? "100 trade terakhir + statistik" : "Last 100 trades + statistics"}
        </p>
      </div>

      {/* Stats summary */}
      {trades && trades.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Total Trade</div>
            <div className="mt-1 text-2xl font-bold">{total}</div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Win Rate</div>
            <div className="mt-1 text-2xl font-bold">{wr.toFixed(1)}%</div>
            <div className="mt-1 text-[10px] text-[var(--color-text-muted)]">
              {wins}W / {losses}L / {beps}BEP
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Net PnL</div>
            <div className={`mt-1 text-2xl font-bold ${totalPnl >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
              {fmtUsd(totalPnl)}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
            <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Avg per Trade</div>
            <div className={`mt-1 text-2xl font-bold ${totalPnl >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
              {total > 0 ? fmtUsd(totalPnl / total) : "—"}
            </div>
          </div>
        </div>
      )}

      {trades === null && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
            {locale === "id" ? "Memuat..." : "Loading..."}
          </div>
        </div>
      )}

      {trades && trades.length === 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            {locale === "id" ? "Belum ada trade selesai." : "No closed trades yet."}
          </p>
        </div>
      )}

      {trades && trades.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 720 }}>
              <thead className="text-[var(--color-text-muted)] bg-[var(--color-bg-primary)]/50">
                <tr>
                  <th className="py-3 px-4 text-left">Time</th>
                  <th className="py-3 px-4 text-left">Coin</th>
                  <th className="py-3 px-4 text-left">Strategy</th>
                  <th className="py-3 px-4 text-right">Outcome</th>
                  <th className="py-3 px-4 text-right">PnL</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const isWin = +t.pnl_usd > 0;
                  const isLoss = +t.pnl_usd < 0;
                  const isLong = t.direction === "LONG";
                  return (
                    <tr key={t.id} className="border-t border-[var(--color-border)]/40">
                      <td className="py-3 px-4 text-[var(--color-text-muted)]">
                        {dateStr(t.closed_at, locale)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {isLong ? (
                            <TrendingUp size={14} className="text-[var(--color-success)]" />
                          ) : (
                            <TrendingDown size={14} className="text-[var(--color-danger)]" />
                          )}
                          <span className="font-semibold">{t.symbol}</span>
                          <span className={`text-[10px] font-bold ${isLong ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                            {t.direction}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-[var(--color-bg-primary)] px-2 py-0.5 text-[10px] font-semibold uppercase">
                          {t.strategy}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold text-[10px] uppercase rounded-full px-2 py-0.5 ${
                            isWin
                              ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                              : isLoss
                              ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                              : "bg-[var(--color-text-muted)]/15 text-[var(--color-text-muted)]"
                          }`}
                        >
                          {isWin ? "PROFIT" : isLoss ? "LOSS" : "BEP"}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${isWin ? "text-[var(--color-success)]" : isLoss ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"}`}>
                        {fmtUsd(+t.pnl_usd)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
