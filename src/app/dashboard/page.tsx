"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import MarketOverview from "@/components/MarketOverview";
import { Bot, CreditCard, Link2, User, ChevronRight, Sparkles, Activity, BarChart3, Briefcase } from "lucide-react";
import Link from "next/link";

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
      title: locale === "id" ? "Auto-Trade Pribadi" : "Personal Auto-Trade",
      value: locale === "id" ? "Phase 2" : "Phase 2",
      desc: locale === "id"
        ? "Saat ini: signal sharing dari bot kami. Auto-trade ke akun pribadi via API key kamu (Bitunix/MEXC/BingX) hadir di Phase 2."
        : "Currently: signal sharing from our bot. Personal auto-trade via your API key (Bitunix/MEXC/BingX) launches Phase 2.",
      action: locale === "id" ? "Pelajari Glossary" : "Learn Glossary",
      href: "/glossary",
      color: "text-[var(--color-accent)]",
    },
  ];

  // Welcome panel untuk user yang baru login (belum subscribe)
  const showWelcome = !isActive;

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

      {/* Welcome onboarding untuk user belum subscribe */}
      {showWelcome && (
        <div className="mb-6 rounded-2xl border border-[var(--color-accent)]/40 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/20">
              <Sparkles size={20} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold">
                {locale === "id" ? `Halo ${user.name}, selamat datang! 👋` : `Hello ${user.name}, welcome! 👋`}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {locale === "id"
                  ? "Akun kamu aktif. Berikut langkah selanjutnya:"
                  : "Your account is active. Here's what to do next:"}
              </p>
              <ol className="mt-3 space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">1</span>
                  <span>
                    {locale === "id" ? (
                      <>Cek <Link href="/proof" className="font-semibold text-[var(--color-accent-light)] underline">Bukti Performa Live</Link> kami — lihat WR, EV, dan distribusi hasil real dari production.</>
                    ) : (
                      <>Check our <Link href="/proof" className="font-semibold text-[var(--color-accent-light)] underline">Live Performance Proof</Link> — see real WR, EV, and outcome distribution from production.</>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">2</span>
                  <span>
                    {locale === "id" ? (
                      <>Pelajari istilah trading di <Link href="/glossary" className="font-semibold text-[var(--color-accent-light)] underline">Glossary</Link> (TP1/SL/BEP/RR/EV).</>
                    ) : (
                      <>Learn trading terms in our <Link href="/glossary" className="font-semibold text-[var(--color-accent-light)] underline">Glossary</Link> (TP1/SL/BEP/RR/EV).</>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">3</span>
                  <span>
                    {locale === "id" ? (
                      <>Subscribe untuk akses signal real-time + notif Telegram. <Link href="/#pricing" className="font-semibold text-[var(--color-accent-light)] underline">Lihat paket →</Link></>
                    ) : (
                      <>Subscribe for real-time signals + Telegram alerts. <Link href="/#pricing" className="font-semibold text-[var(--color-accent-light)] underline">View plans →</Link></>
                    )}
                  </span>
                </li>
              </ol>

              {/* Quick links */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dashboard/signals" className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-xs font-medium transition hover:border-[var(--color-accent)]/50">
                  <Activity size={12} /> {locale === "id" ? "Lihat Sinyal" : "Signals"}
                </Link>
                <Link href="/dashboard/positions" className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-xs font-medium transition hover:border-[var(--color-accent)]/50">
                  <Briefcase size={12} /> {locale === "id" ? "Posisi" : "Positions"}
                </Link>
                <Link href="/dashboard/statistics" className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-xs font-medium transition hover:border-[var(--color-accent)]/50">
                  <BarChart3 size={12} /> {locale === "id" ? "Statistik" : "Statistics"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
