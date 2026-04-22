"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Activity,
  Briefcase,
  History,
} from "lucide-react";
import { useLang } from "./LanguageProvider";

type NavItem = {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  labelId: string;
  labelEn: string;
};

const NAV: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, labelId: "Overview", labelEn: "Overview" },
  { href: "/dashboard/news", icon: Newspaper, labelId: "Berita", labelEn: "News" },
  { href: "/dashboard/signals", icon: Activity, labelId: "Signal", labelEn: "Signals" },
  { href: "/dashboard/positions", icon: Briefcase, labelId: "Posisi", labelEn: "Positions" },
  { href: "/dashboard/history", icon: History, labelId: "Riwayat", labelEn: "History" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { locale } = useLang();

  return (
    <nav
      aria-label="Dashboard navigation"
      className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 md:flex-col md:gap-0.5 md:overflow-visible md:border-b-0 md:border-r md:p-3 md:w-56 md:flex-shrink-0"
    >
      {NAV.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap ${
              active
                ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-primary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span>{locale === "id" ? item.labelId : item.labelEn}</span>
          </Link>
        );
      })}
    </nav>
  );
}
