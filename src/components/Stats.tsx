"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "./LanguageProvider";

type LiveStats = {
  all: { total: string; wins: string; net_pnl: string; avg_r: string | null };
};

export default function Stats() {
  const { t, locale } = useLang();
  const [live, setLive] = useState<LiveStats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setLive(d.stats); })
      .catch(() => {});
  }, []);

  // Live data kalau ada, fallback ke generic descriptor (tidak claim).
  // Card 3 = EV per trade (avg R), informatif tanpa kesan iklan.
  const allTotal = live ? parseInt(live.all.total || "0") : 0;
  const allPnl   = live ? parseFloat(live.all.net_pnl || "0") : 0;
  const allAvgR  = live && live.all.avg_r != null
    ? parseFloat(String(live.all.avg_r))
    : null;

  const items = [
    {
      value: allTotal > 0 ? `${allTotal}` : "100+",
      label: locale === "id" ? "Trade Tracked" : "Trades Tracked",
    },
    {
      value: allTotal > 0 ? `${allPnl >= 0 ? "+" : ""}$${allPnl.toFixed(0)}` : "Live",
      label: locale === "id" ? "PnL Total" : "Total PnL",
    },
    {
      value: allTotal > 0 && allAvgR !== null
        ? `${allAvgR >= 0 ? "+" : ""}${allAvgR.toFixed(2)}R`
        : "Live",
      label: locale === "id" ? "EV per Trade" : "EV per Trade",
    },
    { value: "24/7", label: t.stats.uptime },
  ];

  return (
    <section className="relative py-20 sm:py-28 gradient-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.stats.title}</h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            {t.stats.subtitle}
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center"
            >
              <span className="text-3xl font-bold bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-accent)] bg-clip-text text-transparent sm:text-4xl">
                {s.value}
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
