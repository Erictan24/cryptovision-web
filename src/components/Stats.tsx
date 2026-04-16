"use client";

import { motion } from "framer-motion";
import { useLang } from "./LanguageProvider";

export default function Stats() {
  const { t } = useLang();

  const items = [
    { value: "65.7%", label: t.stats.wr },
    { value: "1,200+", label: t.stats.trades },
    { value: "+0.29R", label: t.stats.ev },
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
              <span className="text-3xl font-bold bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent sm:text-4xl">
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
