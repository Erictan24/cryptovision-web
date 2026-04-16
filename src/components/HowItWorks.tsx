"use client";

import { motion } from "framer-motion";
import { UserPlus, Link2, Bot } from "lucide-react";
import { useLang } from "./LanguageProvider";

export default function HowItWorks() {
  const { t } = useLang();

  const steps = [
    { icon: UserPlus, title: t.how.step1_title, desc: t.how.step1_desc, num: "01" },
    { icon: Link2, title: t.how.step2_title, desc: t.how.step2_desc, num: "02" },
    { icon: Bot, title: t.how.step3_title, desc: t.how.step3_desc, num: "03" },
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
          <h2 className="text-3xl font-bold sm:text-4xl">{t.how.title}</h2>
          <p className="mt-3 text-[var(--color-text-secondary)]">
            {t.how.subtitle}
          </p>
        </motion.div>

        <div className="relative mt-14 grid gap-8 sm:grid-cols-3">
          {/* Connector line (desktop) */}
          <div className="pointer-events-none absolute top-16 left-[16.6%] right-[16.6%] hidden h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/30 to-transparent sm:block" />

          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Number + Icon */}
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border-accent)] bg-[var(--color-bg-card)]">
                  <s.icon size={24} className="text-[var(--color-accent)]" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">
                  {s.num}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
