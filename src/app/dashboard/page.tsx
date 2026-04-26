"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import MarketOverview from "@/components/MarketOverview";
import { Bot, CreditCard, Link2, User, ChevronRight } from "lucide-react";

type Sub = { plan: string; planName?: string; plan_name?: string; status: string } | null;

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { locale } = useLang();
  const [sub, setSub] = useState<Sub>(null);

  useEffect(() => {
    if (user) {
      fetch("/api/subscription")
        .then((r) => r.json())
        .then((d) => setSub(d.subscription || null))
        .catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const isActive = sub?.status === "active";
  const planName = sub?.plan_name || sub?.planName || sub?.plan || "";

  const cards = [
    {
      icon: CreditCard,
      title: locale === "id" ? "Status Langganan" : "Subscription",
      value: isActive ? planName : "Free",
      desc: isActive
        ? locale === "id" ? `Langganan ${planName} aktif` : `${planName} subscription active`
        : locale === "id" ? "Upgrade untuk auto trade & signal real-time" : "Upgrade for auto trade & real-time signals",
      action: isActive
        ? locale === "id" ? "Kelola" : "Manage"
        : locale === "id" ? "Upgrade" : "Upgrade",
      href: "/checkout",
      color: isActive ? "text-[var(--color-success)]" : "text-[var(--color-accent)]",
    },
    {
      icon: Bot,
      title: locale === "id" ? "Status Bot" : "Bot Status",
      value: isActive
        ? locale === "id" ? "Aktif" : "Active"
        : locale === "id" ? "Belum Aktif" : "Not Active",
      desc: isActive
        ? locale === "id" ? "Bot sedang berjalan" : "Bot is running"
        : locale === "id" ? "Aktifkan bot setelah upgrade & connect exchange" : "Activate bot after upgrade & connect exchange",
      action: isActive
        ? locale === "id" ? "Pengaturan" : "Settings"
        : locale === "id" ? "Lihat Paket" : "View Plans",
      href: "/checkout",
      color: isActive ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]",
    },
    {
      icon: Link2,
      title: locale === "id" ? "Exchange" : "Exchange",
      value: locale === "id" ? "Belum Terhubung" : "Not Connected",
      desc: locale === "id" ? "Hubungkan Bitunix, MEXC, atau BingX" : "Connect Bitunix, MEXC, or BingX",
      action: locale === "id" ? "Segera hadir" : "Coming soon",
      href: null,
      color: "text-[var(--color-text-muted)]",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {locale === "id" ? "Halo" : "Hello"}, {user.name}!
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {user.username && (
            <span className="text-[var(--color-accent)]">@{user.username}</span>
          )}{" "}
          {locale === "id" ? "— Terhubung via Telegram" : "— Connected via Telegram"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className="card-glow rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-bg-primary)]">
                <c.icon size={20} className={c.color} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">{c.title}</p>
                <p className="font-semibold">{c.value}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">{c.desc}</p>
            {c.href ? (
              <a
                href={c.href}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] transition hover:text-[var(--color-accent-light)]"
              >
                {c.action}
                <ChevronRight size={12} />
              </a>
            ) : (
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)]">
                {c.action}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <MarketOverview />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
        <div className="flex items-center gap-2">
          <User size={16} className="text-[var(--color-text-muted)]" />
          <span className="text-sm font-medium">
            {locale === "id" ? "Info Akun" : "Account Info"}
          </span>
        </div>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Telegram ID</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">Provider</span>
            <span>Telegram</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--color-text-muted)]">
              {locale === "id" ? "Paket" : "Plan"}
            </span>
            <span className={isActive ? "text-[var(--color-success)] font-semibold" : ""}>
              {isActive ? planName : "Free"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
