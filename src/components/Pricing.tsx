"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, Crown } from "lucide-react";
import { useLang } from "./LanguageProvider";

export default function Pricing() {
  const { t } = useLang();
  const [usd, setUsd] = useState(false);

  const p = t.pricing;
  const plans = [
    {
      key: "free",
      name: p.free_name,
      price: usd ? p.free_price_usd : p.free_price_idr,
      subtitle: "",
      features: [p.free_f1, p.free_f2, p.free_f3, p.free_f4],
      cta: p.cta_free,
      badge: null,
      accent: false,
      href: "/login",
    },
    {
      key: "m1",
      name: p.m1_name,
      price: usd ? p.m1_price_usd : p.m1_price_idr,
      subtitle: p.monthly,
      features: [p.m1_f1, p.m1_f2, p.m1_f3, p.m1_f4],
      cta: p.cta,
      badge: null,
      accent: false,
      href: "/checkout?plan=m1",
    },
    {
      key: "m3",
      name: p.m3_name,
      price: usd ? p.m3_price_usd : p.m3_price_idr,
      subtitle: usd ? p.m3_per_month_usd + p.per_month : p.m3_per_month_idr + p.per_month,
      save: p.m3_save,
      features: [p.m3_f1, p.m3_f2, p.m3_f3, p.m3_f4],
      cta: p.cta,
      badge: p.popular,
      accent: true,
      href: "/checkout?plan=m3",
    },
    {
      key: "y1",
      name: p.y1_name,
      price: usd ? p.y1_price_usd : p.y1_price_idr,
      subtitle: usd ? p.y1_per_month_usd + p.per_month : p.y1_per_month_idr + p.per_month,
      save: p.y1_save,
      features: [p.y1_f1, p.y1_f2, p.y1_f3, p.y1_f4],
      cta: p.cta,
      badge: p.best_value,
      accent: false,
      href: "/checkout?plan=y1",
    },
    {
      key: "lt",
      name: p.lt_name,
      price: usd ? p.lt_price_usd : p.lt_price_idr,
      subtitle: p.once,
      features: [p.lt_f1, p.lt_f2, p.lt_f3, p.lt_f4],
      cta: p.cta,
      badge: null,
      accent: false,
      href: "/checkout?plan=lt",
    },
  ];

  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{p.title}</h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">{p.subtitle}</p>

          {/* Currency toggle */}
          <div className="mt-6 inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1 text-sm">
            <button
              onClick={() => setUsd(false)}
              className={`rounded-md px-4 py-1.5 font-medium transition ${
                !usd ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)]"
              }`}
            >
              {p.currency_idr}
            </button>
            <button
              onClick={() => setUsd(true)}
              className={`rounded-md px-4 py-1.5 font-medium transition ${
                usd ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)]"
              }`}
            >
              {p.currency_usd}
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="mt-16 grid items-stretch gap-5 pt-4 sm:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className={`card-glow shine-hover relative flex h-full flex-col rounded-2xl border p-5 transition-shadow ${
                plan.accent
                  ? "border-[var(--color-accent)] bg-[var(--color-bg-card)] glow-border shadow-lg shadow-[var(--color-accent)]/20 lg:scale-[1.04]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-accent)]/50"
              }`}
            >
              {plan.badge && (
                <span className={`absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold shadow-md ${
                  plan.badge === p.best_value
                    ? "bg-[var(--color-gold)] text-black"
                    : "bg-[var(--color-accent)] text-white"
                }`}>
                  {plan.badge === p.best_value ? <Crown size={11} /> : <Star size={11} fill="white" />}
                  {plan.badge}
                </span>
              )}

              <h3 className="text-base font-semibold">{plan.name}</h3>

              {/* Save badge — reserve space so all prices align */}
              <div className="mt-1 h-5">
                {plan.save && (
                  <span className="inline-flex items-center rounded-full bg-[var(--color-success)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-success)]">
                    {p.save} {plan.save}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold leading-tight">{plan.price}</span>
                {plan.subtitle && (
                  <span className="text-xs text-[var(--color-text-muted)]">{plan.subtitle}</span>
                )}
              </div>

              <div className="my-4 h-px bg-[var(--color-border)]/60" />

              <ul className="flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                    <Check size={12} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`mt-6 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                  plan.accent
                    ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] btn-pulse"
                    : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-light)]"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
