"use client";

import { History } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

export default function HistoryPage() {
  const { locale } = useLang();
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <History size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Riwayat Signal" : "Signal History"}
        </h2>
      </div>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === "id"
            ? "Riwayat signal + win rate stats akan hadir segera."
            : "Signal history + win rate stats coming soon."}
        </p>
      </div>
    </div>
  );
}
