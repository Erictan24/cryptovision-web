"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import {
  LogOut,
  Bot,
  CreditCard,
  Link2,
  User,
  ChevronRight,
} from "lucide-react";

type Sub = { plan: string; planName?: string; plan_name?: string; status: string } | null;

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { locale, t, toggle } = useLang();
  const [sub, setSub] = useState<Sub>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  // Fetch subscription status
  useEffect(() => {
    if (user) {
      fetch("/api/subscription")
        .then((r) => r.json())
        .then((d) => setSub(d.subscription || null))
        .catch(() => {});
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  const isActive = sub?.status === "active";
  // DB returns snake_case (plan_name), handle both
  const planName = sub?.plan_name || sub?.planName || sub?.plan || "";

  const cards = [
    {
      icon: CreditCard,
      title: locale === "id" ? "Status Langganan" : "Subscription",
      value: isActive ? planName : "Free",
      desc: isActive
        ? (locale === "id" ? `Langganan ${planName} aktif` : `${planName} subscription active`)
        : (locale === "id" ? "Upgrade untuk auto trade & signal real-time" : "Upgrade for auto trade & real-time signals"),
      action: isActive
        ? (locale === "id" ? "Kelola" : "Manage")
        : (locale === "id" ? "Upgrade" : "Upgrade"),
      href: "/checkout",
      color: isActive ? "text-[var(--color-success)]" : "text-[var(--color-accent)]",
    },
    {
      icon: Bot,
      title: locale === "id" ? "Status Bot" : "Bot Status",
      value: isActive
        ? (locale === "id" ? "Aktif" : "Active")
        : (locale === "id" ? "Belum Aktif" : "Not Active"),
      desc: isActive
        ? (locale === "id" ? "Bot sedang berjalan" : "Bot is running")
        : (locale === "id" ? "Aktifkan bot setelah upgrade & connect exchange" : "Activate bot after upgrade & connect exchange"),
      action: isActive
        ? (locale === "id" ? "Pengaturan" : "Settings")
        : (locale === "id" ? "Lihat Paket" : "View Plans"),
      href: "/checkout",
      color: isActive ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]",
    },
    {
      icon: Link2,
      title: locale === "id" ? "Exchange" : "Exchange",
      value: locale === "id" ? "Belum Terhubung" : "Not Connected",
      desc:
        locale === "id"
          ? "Hubungkan Bitunix, MEXC, atau BingX"
          : "Connect Bitunix, MEXC, or BingX",
      action: locale === "id" ? "Hubungkan" : "Connect",
      href: "#",
      color: "text-[var(--color-text-muted)]",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="CryptoVision" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-lg font-bold">CryptoVision</span>
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-muted)] hover:border-[var(--color-accent)]"
            >
              {locale === "id" ? "EN" : "ID"}
            </button>

            <div className="flex items-center gap-2">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt=""
                  className="h-7 w-7 rounded-full"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-xs font-bold text-[var(--color-accent)]">
                  {user.name[0]}
                </div>
              )}
              <span className="hidden text-sm font-medium sm:block">
                {user.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="rounded-md border border-[var(--color-border)] p-1.5 text-[var(--color-text-muted)] transition hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {locale === "id" ? "Halo" : "Hello"}, {user.name}!
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {user.username && (
              <span className="text-[var(--color-accent)]">
                @{user.username}
              </span>
            )}
            {" "}
            {locale === "id"
              ? "— Terhubung via Telegram"
              : "— Connected via Telegram"}
          </p>
        </div>

        {/* Cards */}
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
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {c.title}
                  </p>
                  <p className="font-semibold">{c.value}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                {c.desc}
              </p>
              <a
                href={c.href}
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] transition hover:text-[var(--color-accent-light)]"
              >
                {c.action}
                <ChevronRight size={12} />
              </a>
            </div>
          ))}
        </div>

        {/* Telegram ID info */}
        <div className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
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
      </main>
    </div>
  );
}
