"use client";

import { useState } from "react";
import { Calendar, Newspaper } from "lucide-react";
import NewsSection from "@/components/NewsSection";
import CryptoNewsFeed from "@/components/CryptoNewsFeed";
import { useLang } from "@/components/LanguageProvider";

type Tab = "calendar" | "news";

export default function NewsPage() {
  const { locale } = useLang();
  const [tab, setTab] = useState<Tab>("news");

  const tabs: { key: Tab; label: { id: string; en: string }; icon: typeof Calendar }[] = [
    { key: "news",     label: { id: "Berita Crypto",     en: "Crypto News" },        icon: Newspaper },
    { key: "calendar", label: { id: "Kalender Ekonomi",  en: "Economic Calendar" },  icon: Calendar },
  ];

  return (
    <div>
      {/* Tab switcher */}
      <div className="mb-6 inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1">
        {tabs.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-[var(--color-accent)] text-white shadow-sm"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              }`}
            >
              <Icon size={14} />
              {t.label[locale]}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      {tab === "news" ? <CryptoNewsFeed /> : <NewsSection />}
    </div>
  );
}
