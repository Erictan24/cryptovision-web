"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Target, Shield, AlertTriangle, TrendingUp, TrendingDown, ArrowLeft, ExternalLink } from "lucide-react";
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

type Bucket = { total: number; wins: number; avg_r: number | null; net_pnl_usd: number | null };
type StrategyRow = Bucket & { strategy: string };
type QualityRow  = Bucket & { quality: string };

type Performance = {
  summary: Summary;
  by_strategy: StrategyRow[];
  by_quality: QualityRow[];
};

function fmtPct(n: number): string { return `${n.toFixed(1)}%`; }
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

export default function ProofPage() {
  const { locale } = useLang();
  const [data, setData] = useState<Performance | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/performance?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setData({ summary: d.summary, by_strategy: d.by_strategy, by_quality: d.by_quality });
        else setError(true);
      })
      .catch(() => setError(true));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] transition hover:text-[var(--color-accent-light)]"
        >
          <ArrowLeft size={14} /> {locale === "id" ? "Kembali ke Beranda" : "Back to Home"}
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <BarChart3 size={26} className="text-[var(--color-accent)]" />
          <h1 className="text-3xl font-bold">
            {locale === "id" ? "Bukti Performa Live" : "Live Performance Proof"}
          </h1>
        </div>
        <p className="mb-8 text-sm text-[var(--color-text-muted)]">
          {locale === "id"
            ? "Statistik real dari semua trade bot kami — bukan klaim, bukan demo. Update dari database produksi."
            : "Real stats from all bot trades — no claims, no demo. Direct from production database."}
        </p>

        {error && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              {locale === "id" ? "Gagal memuat data." : "Failed to load data."}
            </p>
          </div>
        )}

        {!data && !error && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
              {locale === "id" ? "Memuat..." : "Loading..."}
            </div>
          </div>
        )}

        {data && data.summary && data.summary.total === 0 && (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              {locale === "id"
                ? "Belum ada trade selesai untuk dianalisa. Bot baru mulai live, tunggu beberapa hari."
                : "No closed trades yet. Bot just went live, give it a few days."}
            </p>
          </div>
        )}

        {data && data.summary && data.summary.total > 0 && (() => {
          const s = data.summary;
          const wr     = s.total > 0 ? (s.wins / s.total) * 100 : 0;
          const tp2Pct = s.total > 0 ? (s.tp2_count / s.total) * 100 : 0;
          const tp1Pct = s.total > 0 ? (s.tp1_count / s.total) * 100 : 0;
          const bepPct = s.total > 0 ? (s.bep_count / s.total) * 100 : 0;
          const slPct  = s.total > 0 ? (s.sl_count  / s.total) * 100 : 0;
          const evColor  = (s.avg_r ?? 0) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";
          const pnlColor = (s.net_pnl_usd ?? 0) >= 0 ? "text-[var(--color-success)]" : "text-[var(--color-danger)]";

          const outcomes = [
            { key: "tp2", icon: Target,         label: "TP2 Full",   pct: tp2Pct, count: s.tp2_count, color: "text-[var(--color-success)]", bg: "bg-[var(--color-success)]/15" },
            { key: "tp1", icon: TrendingUp,     label: "TP1 Partial", pct: tp1Pct, count: s.tp1_count, color: "text-[var(--color-success)]", bg: "bg-[var(--color-success)]/10" },
            { key: "bep", icon: Shield,         label: "BEP",         pct: bepPct, count: s.bep_count, color: "text-[var(--color-text-secondary)]", bg: "bg-[var(--color-text-muted)]/15" },
            { key: "sl",  icon: AlertTriangle,  label: "SL",          pct: slPct,  count: s.sl_count,  color: "text-[var(--color-danger)]",  bg: "bg-[var(--color-danger)]/15" },
          ];

          return (
            <>
              {/* Headline */}
              <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title={locale === "id" ? "Total Trade" : "Total Trades"} value={String(s.total)} sub={`${s.wins}W / ${s.losses}L / ${s.bep_count}BEP`} />
                <StatCard title="Win Rate" value={fmtPct(wr)} sub={locale === "id" ? "PROFIT vs LOSS" : "PROFIT vs LOSS"} />
                <StatCard title={locale === "id" ? "EV per Trade" : "EV per Trade"} value={fmtR(s.avg_r)} sub={locale === "id" ? "rata-rata R" : "avg R"} valueColor={evColor} />
                <StatCard title="Net PnL" value={fmtUsd(s.net_pnl_usd)} sub={`Avg ${fmtUsd(s.avg_pnl_usd)}/trade`} valueColor={pnlColor} />
              </div>

              {/* Outcome */}
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                {locale === "id" ? "Distribusi Hasil" : "Outcome Distribution"}
              </h3>
              <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {outcomes.map((o) => {
                  const Icon = o.icon;
                  return (
                    <div key={o.key} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${o.bg}`}>
                          <Icon size={16} className={o.color} />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{o.label}</div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{o.count}</span>
                        <span className="text-sm text-[var(--color-text-muted)]">({fmtPct(o.pct)})</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-primary)]">
                        <div className={`h-full ${o.bg.replace("/15","/60").replace("/10","/60")}`} style={{ width: `${Math.min(o.pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="mb-8 rounded-2xl border border-[var(--color-accent)] bg-[var(--color-bg-card)] p-6 text-center">
                <h3 className="text-lg font-bold">
                  {locale === "id"
                    ? "Tertarik join? Lihat paket subscription"
                    : "Interested? Check our pricing"}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {locale === "id"
                    ? "Subscriber dapat akses signal real-time, riwayat lengkap, dan notif Telegram langsung."
                    : "Subscribers get real-time signals, full history, and direct Telegram alerts."}
                </p>
                <Link
                  href="/#pricing"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-light)]"
                >
                  {locale === "id" ? "Lihat Paket" : "View Plans"} <ExternalLink size={14} />
                </Link>
              </div>

              {/* Best/Worst */}
              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--color-success)]">
                    <TrendingUp size={12} /> {locale === "id" ? "Trade Terbaik" : "Best Trade"}
                  </div>
                  <div className="mt-1 text-2xl font-bold text-[var(--color-success)]">{fmtR(s.best_r)}</div>
                </div>
                <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[var(--color-danger)]">
                    <TrendingDown size={12} /> {locale === "id" ? "Trade Terburuk" : "Worst Trade"}
                  </div>
                  <div className="mt-1 text-2xl font-bold text-[var(--color-danger)]">{fmtR(s.worst_r)}</div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="mt-8 text-xs text-[var(--color-text-muted)]">
                {locale === "id"
                  ? "* Performa lampau bukan jaminan hasil masa depan. Trading crypto futures berisiko tinggi — hanya gunakan modal yang siap kamu hilangkan."
                  : "* Past performance is no guarantee of future results. Crypto futures trading is high-risk — only trade with money you can afford to lose."}
              </p>
            </>
          );
        })()}
      </div>
    </main>
  );
}

function StatCard({ title, value, sub, valueColor = "" }: { title: string; value: string; sub: string; valueColor?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="text-[10px] uppercase text-[var(--color-text-muted)]">{title}</div>
      <div className={`mt-1 text-3xl font-bold ${valueColor}`}>{value}</div>
      <div className="mt-1 text-[11px] text-[var(--color-text-muted)]">{sub}</div>
    </div>
  );
}
