"use client";

import { Activity } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

export default function SignalsPage() {
  const { locale } = useLang();
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Activity size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Signal Aktif" : "Active Signals"}
        </h2>
      </div>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === "id"
            ? "Fitur signal real-time akan hadir segera. Bot sedang dalam fase validasi WR 60%."
            : "Real-time signals coming soon. Bot is in WR 60% validation phase."}
        </p>
      </div>
    </div>
  );
}
