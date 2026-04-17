"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
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
      features: [p.free_f1, p.free_f2, p.free_f3, p.free_f4],
      cta: p.cta_free,
      popular: false,
      accent: false,
      comingSoon: false,
      href: "/login",
    },
    {
      key: "single",
      name: p.single_name,
      price: usd ? p.single_price_usd : p.single_price_idr,
      features: [p.single_f1, p.single_f2, p.single_f3, p.single_f4],
      cta: p.cta,
      popular: false,
      accent: false,
      comingSoon: false,
      href: "/checkout?plan=single",
    },
    {
      key: "dual",
      name: p.dual_name,
      price: usd ? p.dual_price_usd : p.dual_price_idr,
      originalPrice: usd ? p.dual_original_usd : p.dual_original_idr,
      discount: p.dual_discount,
      features: [p.dual_f1, p.dual_f2, p.dual_f3, p.dual_f4],
      cta: p.cta,
      popular: true,
      accent: true,
      comingSoon: false,
      href: "/checkout?plan=dual",
    },
    {
      key: "indicator",
      name: p.indicator_name,
      price: usd ? p.indicator_price_usd : p.indicator_price_idr,
      features: [p.indicator_f1, p.indicator_f2, p.indicator_f3, p.indicator_f4],
      cta: p.cta,
      popular: false,
      accent: false,
      comingSoon: true,
      href: "#",
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
          <h2 className="text-3xl font-bold sm:text-4xl">{t.pricing.title}</h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            {t.pricing.subtitle}
          </p>

          {/* Currency toggle */}
          <div className="mt-6 inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1 text-sm">
            <button
              onClick={() => setUsd(false)}
              className={`rounded-md px-4 py-1.5 font-medium transition ${
                !usd
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {t.pricing.currency_idr}
            </button>
            <button
              onClick={() => setUsd(true)}
              className={`rounded-md px-4 py-1.5 font-medium transition ${
                usd
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {t.pricing.currency_usd}
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`card-glow relative rounded-2xl border p-6 ${
                plan.accent
                  ? "border-[var(--color-accent)] bg-[var(--color-bg-card)] glow-border"
                  : "border-[var(--color-border)] bg-[var(--color-bg-card)]"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[var(--color-gold)] px-3 py-0.5 text-xs font-semibold text-black">
                  <Star size={10} fill="black" /> {t.pricing.popular}
                </span>
              )}

              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.comingSoon && (
                  <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-medium text-purple-400">
                    {t.pricing.coming_soon}
                  </span>
                )}
              </div>

              <div className="mt-3">
                {plan.originalPrice && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[var(--color-text-muted)] line-through">{plan.originalPrice}</span>
                    <span className="rounded-full bg-[var(--color-gold)]/20 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-gold)]">
                      {plan.discount}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {t.pricing.monthly}
                  </span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]"
                  >
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0 text-[var(--color-success)]"
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.comingSoon ? undefined : plan.href}
                className={`mt-6 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                  plan.comingSoon
                    ? "border border-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-50"
                    : plan.accent
                      ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-light)] glow-blue"
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
