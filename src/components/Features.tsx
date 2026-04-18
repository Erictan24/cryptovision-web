"use client";

import { motion } from "framer-motion";
import { Zap, TrendingUp, BarChart3, Check } from "lucide-react";
import { useLang } from "./LanguageProvider";

export default function Features() {
  const { t } = useLang();

  const cards = [
    {
      icon: Zap,
      title: t.features.scalp_title,
      desc: t.features.scalp_desc,
      features: [t.features.scalp_f1, t.features.scalp_f2, t.features.scalp_f3, t.features.scalp_f4],
      accent: "from-blue-500 to-cyan-400",
      badge: null,
    },
    {
      icon: TrendingUp,
      title: t.features.swing_title,
      desc: t.features.swing_desc,
      features: [t.features.swing_f1, t.features.swing_f2, t.features.swing_f3, t.features.swing_f4],
      accent: "from-green-500 to-emerald-400",
      badge: null,
    },
  ];

  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.features.title}</h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            {t.features.subtitle}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="card-glow relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
            >
              {c.badge && (
                <span className="absolute top-4 right-4 rounded-full bg-purple-500/20 px-3 py-0.5 text-xs font-medium text-purple-400">
                  {c.badge}
                </span>
              )}

              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.accent} text-white`}
              >
                <c.icon size={22} />
              </div>

              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {c.desc}
              </p>

              <ul className="mt-5 space-y-2">
                {c.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    <Check size={14} className="shrink-0 text-[var(--color-success)]" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
