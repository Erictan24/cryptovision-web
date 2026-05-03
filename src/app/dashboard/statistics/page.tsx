"use client";

import { useEffect, useState } from "react";
import { BarChart3, Target, Shield, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

type Summary = {
  total: number;
  tp2_count: number;
  tp1_count: number;
  bep_count: number;
  sl_count: number;
  wins: number;
  losses: number;
  avg_r: number | null;
  net_pnl_usd: number | null;
  avg_pnl_usd: number | null;
  best_r: number | null;
  worst_r: number | null;
};

type Bucket = {
  total: number;
  wins: number;
  avg_r: number | null;
  net_pnl_usd: number | null;
};

type StrategyRow = Bucket & { strategy: string };
type QualityRow  = Bucket & { quality: string };
type DirRow      = Bucket & { direction: string };

type Performance = {
  summary: Summary;
  by_strategy: StrategyRow[];
  by_quality: QualityRow[];
  by_direction: DirRow[];
};

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}
function fmtUsd(n: number | null): string {
  if (n === null || n === undefined) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${n.toFixed(2)}`;
}
function fmtR(n: number | null): string {
  if (n === null || n === undefined) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}R`;
}

export default function StatisticsPage() {
  const { locale } = useLang();
  const [data, setData] = useState<Performance | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/performance?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setData({
          summary: d.summary,
          by_strategy: d.by_strategy,
          by_quality: d.by_quality,
          by_direction: d.by_direction,
        });
        else setError(true);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === "id" ? "Gagal memuat statistik." : "Failed to load statistics."}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
          {locale === "id" ? "Memuat statistik..." : "Loading statistics..."}
        </div>
      </div>
    );
  }

  const s = data.summary;
  if (!s || s.total === 0) {
    return (
      <div>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-[var(--color-accent)]" />
          <h2 className="text-lg font-bold">
            {locale === "id" ? "Statistik Performance" : "Performance Statistics"}
          </h2>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
          <BarChart3 size={32} className="mx-auto mb-3 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            {locale === "id" ? "Belum ada trade selesai untuk dianalisa." : "No closed trades to analyze yet."}
          </p>
        </div>
      </div>
    );
  }

  const wr     = s.total > 0 ? (s.wins / s.total) * 100 : 0;
  const tp2Pct = s.total > 0 ? (s.tp2_count / s.total) * 100 : 0;
  const tp1Pct = s.total > 0 ? (s.tp1_count / s.total) * 100 : 0;
  const bepPct = s.total > 0 ? (s.bep_count / s.total) * 100 : 0;
  const slPct  = s.total > 0 ? (s.sl_count  / s.total) * 100 : 0;

  // Outcome buckets — visual cards
  const outcomes = [
    {
      key: "tp2",
      icon: Target,
      label: locale === "id" ? "TP2 (Full)" : "TP2 (Full)",
      desc: locale === "id" ? "TP2 target tercapai" : "TP2 target hit",
      count: s.tp2_count,
      pct: tp2Pct,
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success)]/15",
    },
    {
      key: "tp1",
      icon: TrendingUp,
      label: "TP1",
      desc: locale === "id" ? "TP1 + BEP / trail" : "TP1 + BEP / trail",
      count: s.tp1_count,
      pct: tp1Pct,
      color: "text-[var(--color-success)]",
      bg: "bg-[var(--color-success)]/10",
    },
    {
      key: "bep",
      icon: Shield,
      label: "BEP",
      desc: locale === "id" ? "Break-even (~0R)" : "Break-even (~0R)",
      count: s.bep_count,
      pct: bepPct,
      color: "text-[var(--color-text-secondary)]",
      bg: "bg-[var(--color-text-muted)]/15",
    },
    {
      key: "sl",
      icon: AlertTriangle,
      label: "SL",
      desc: locale === "id" ? "Stop Loss kena" : "Stop Loss hit",
      count: s.sl_count,
      pct: slPct,
      color: "text-[var(--color-danger)]",
      bg: "bg-[var(--color-danger)]/15",
    },
  ];

  const evColor    = (s.avg_r ?? 0) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
  const pnlColor   = (s.net_pnl_usd ?? 0) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 size={20} className="text-[var(--color-accent)]" />
        <h2 className="text-xl font-bold">
          {locale === "id" ? "Statistik Performance" : "Performance Statistics"}
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "— semua trade closed (all-time)" : "— all closed trades (all-time)"}
        </span>
      </div>

      {/* Headline metrics */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          <div className="text-[10px] uppercase text-[var(--color-text-muted)]">
            {locale === "id" ? "Total Trade" : "Total Trades"}
          </div>
          <div className="mt-1 text-3xl font-bold">{s.total}</div>
          <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            {s.wins}W / {s.losses}L / {s.bep_count}BEP
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Win Rate</div>
          <div className="mt-1 text-3xl font-bold">{fmtPct(wr)}</div>
          <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            {locale === "id" ? "PROFIT vs LOSS" : "PROFIT vs LOSS"}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          <div className="text-[10px] uppercase text-[var(--color-text-muted)]">EV per Trade</div>
          <div className={`mt-1 text-3xl font-bold ${evColor}`}>{fmtR(s.avg_r)}</div>
          <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            {locale === "id" ? "rata-rata R per trade" : "avg R per trade"}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
          <div className="text-[10px] uppercase text-[var(--color-text-muted)]">Net PnL</div>
          <div className={`mt-1 text-3xl font-bold ${pnlColor}`}>{fmtUsd(s.net_pnl_usd)}</div>
          <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            {locale === "id" ? "Avg " : "Avg "}{fmtUsd(s.avg_pnl_usd)} {locale === "id" ? "/trade" : "/trade"}
          </div>
        </div>
      </div>

      {/* Outcome breakdown */}
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        {locale === "id" ? "Distribusi Hasil" : "Outcome Distribution"}
      </h3>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {outcomes.map((o) => {
          const Icon = o.icon;
          return (
            <div
              key={o.key}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4"
            >
              <div className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${o.bg}`}>
                  <Icon size={16} className={o.color} />
                </div>
                <div>
                  <div className="text-sm font-bold">{o.label}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{o.desc}</div>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{o.count}</span>
                <span className="text-sm text-[var(--color-text-muted)]">({fmtPct(o.pct)})</span>
              </div>
              {/* Mini bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-primary)]">
                <div
                  className={`h-full ${o.bg.replace('/15', '/60').replace('/10', '/60')}`}
                  style={{ width: `${Math.min(o.pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Best / Worst */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--color-success)]">
            <TrendingUp size={12} />
            {locale === "id" ? "Trade Terbaik" : "Best Trade"}
          </div>
          <div className="mt-1 text-2xl font-bold text-[var(--color-success)]">{fmtR(s.best_r)}</div>
        </div>
        <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--color-danger)]">
            <TrendingDown size={12} />
            {locale === "id" ? "Trade Terburuk" : "Worst Trade"}
          </div>
          <div className="mt-1 text-2xl font-bold text-[var(--color-danger)]">{fmtR(s.worst_r)}</div>
        </div>
      </div>

      {/* Breakdown tables */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* By Strategy */}
        <BreakdownTable
          title={locale === "id" ? "Per Strategi" : "By Strategy"}
          rows={data.by_strategy.map((r) => ({ label: r.strategy, ...r }))}
          locale={locale}
        />
        {/* By Quality */}
        <BreakdownTable
          title={locale === "id" ? "Per Kualitas" : "By Quality"}
          rows={data.by_quality.map((r) => ({ label: r.quality, ...r }))}
          locale={locale}
        />
        {/* By Direction */}
        <BreakdownTable
          title={locale === "id" ? "Per Arah" : "By Direction"}
          rows={data.by_direction.map((r) => ({ label: r.direction, ...r }))}
          locale={locale}
        />
      </div>
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
  locale,
}: {
  title: string;
  rows: Array<{ label: string; total: number; wins: number; avg_r: number | null; net_pnl_usd: number | null }>;
  locale: "id" | "en";
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{title}</h4>
      {rows.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          {locale === "id" ? "Belum ada data" : "No data"}
        </p>
      ) : (
        <table className="w-full text-xs">
          <thead className="text-[var(--color-text-muted)] text-[9px] uppercase">
            <tr className="border-b border-[var(--color-border)]">
              <th className="py-1.5 text-left">{locale === "id" ? "Label" : "Label"}</th>
              <th className="py-1.5 text-right">N</th>
              <th className="py-1.5 text-right">WR</th>
              <th className="py-1.5 text-right">EV</th>
              <th className="py-1.5 text-right">PnL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const wr = r.total > 0 ? (r.wins / r.total) * 100 : 0;
              const evColor  = (r.avg_r ?? 0) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
              const pnlColor = (r.net_pnl_usd ?? 0) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
              return (
                <tr key={r.label} className="border-b border-[var(--color-border)]/40 last:border-0">
                  <td className="py-2 font-semibold uppercase">{r.label}</td>
                  <td className="py-2 text-right">{r.total}</td>
                  <td className="py-2 text-right">{wr.toFixed(0)}%</td>
                  <td className={`py-2 text-right font-semibold ${evColor}`}>{fmtR(r.avg_r)}</td>
                  <td className={`py-2 text-right font-semibold ${pnlColor}`}>{fmtUsd(r.net_pnl_usd)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
