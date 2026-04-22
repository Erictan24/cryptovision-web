"use client";

import { Briefcase } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";

export default function PositionsPage() {
  const { locale } = useLang();
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Briefcase size={18} className="text-[var(--color-accent)]" />
        <h2 className="text-lg font-bold">
          {locale === "id" ? "Posisi Terbuka" : "Open Positions"}
        </h2>
      </div>
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          {locale === "id"
            ? "Integrasi posisi live akan hadir segera — bot push ke database setelah arsitektur data selesai."
            : "Live positions coming soon — bot will push to database once data architecture is complete."}
        </p>
      </div>
    </div>
  );
}
