"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Target, Coins } from "lucide-react";
import { useLang } from "./LanguageProvider";

type LiveStats = {
  today: { total: string; wins: string; net_pnl: string; avg_r: string | null };
  month: { total: string; wins: string; net_pnl: string; avg_r: string | null };
  all:   { total: string; wins: string; net_pnl: string; avg_r: string | null };
};

export default function Hero() {
  const { t, locale } = useLang();
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setLive(d.stats); })
      .catch(() => {});
  }, []);

  // Live stats (kalau ada data live) — tampilkan angka apa adanya, tidak claim.
  // Card 3: EV per trade (rata-rata R per trade) — informatif, bukan ad copy.
  const monthTotal = live ? parseInt(live.month.total || "0") : 0;
  const monthPnl   = live ? parseFloat(live.month.net_pnl || "0") : 0;
  const monthAvgR  = live && live.month.avg_r != null
    ? parseFloat(String(live.month.avg_r))
    : null;

  const stats = [
    {
      icon: Coins,
      value: monthTotal > 0 ? `${monthTotal}` : "Live",
      label: monthTotal > 0
        ? (locale === "id" ? "Trade Bulan Ini" : "Trades This Month")
        : (locale === "id" ? "Track Record" : "Track Record"),
    },
    {
      icon: TrendingUp,
      value: monthTotal > 0 ? `${monthPnl >= 0 ? "+" : ""}$${monthPnl.toFixed(2)}` : "Real-Time",
      label: monthTotal > 0
        ? (locale === "id" ? "PnL Bulan Ini" : "PnL This Month")
        : (locale === "id" ? "Dashboard" : "Dashboard"),
    },
    {
      icon: Target,
      value: monthTotal > 0 && monthAvgR !== null
        ? `${monthAvgR >= 0 ? "+" : ""}${monthAvgR.toFixed(2)}R`
        : "24/7",
      label: monthTotal > 0
        ? (locale === "id" ? "EV per Trade" : "EV per Trade")
        : (locale === "id" ? "Otomatis" : "Automated"),
    },
  ];

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 gradient-hero" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-accent)] bg-[var(--color-bg-card)] px-4 py-1.5 text-xs text-[var(--color-accent-light)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            Live Trading Active
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-[var(--color-text-primary)]">
              {t.hero.title.split(" ").slice(0, -2).join(" ")}{" "}
            </span>
            <span className="bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-accent)] bg-clip-text text-transparent">
              {t.hero.title.split(" ").slice(-2).join(" ")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <a
              href="#pricing"
              className="group flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-light)] glow-blue"
            >
              {t.hero.cta_primary}
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#pricing"
              className="rounded-xl border border-[var(--color-border)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent-light)]"
            >
              {t.hero.cta_secondary}
            </a>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="card-glow flex flex-col items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-center cursor-default"
            >
              <s.icon
                size={20}
                className="text-[var(--color-accent)]"
              />
              <span className="text-xl font-bold text-[var(--color-text-primary)] sm:text-2xl">
                {s.value}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
