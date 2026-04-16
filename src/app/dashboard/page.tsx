"use client";

import { useEffect } from "react";
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

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { locale, t, toggle } = useLang();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }

  const cards = [
    {
      icon: CreditCard,
      title: locale === "id" ? "Status Langganan" : "Subscription",
      value: "Free",
      desc:
        locale === "id"
          ? "Upgrade untuk auto trade & signal real-time"
          : "Upgrade for auto trade & real-time signals",
      action: locale === "id" ? "Upgrade" : "Upgrade",
      href: "/#pricing",
      color: "text-[var(--color-accent)]",
    },
    {
      icon: Bot,
      title: locale === "id" ? "Status Bot" : "Bot Status",
      value: locale === "id" ? "Belum Aktif" : "Not Active",
      desc:
        locale === "id"
          ? "Aktifkan bot setelah upgrade & connect exchange"
          : "Activate bot after upgrade & connect exchange",
      action: locale === "id" ? "Lihat Paket" : "View Plans",
      href: "/#pricing",
      color: "text-[var(--color-text-muted)]",
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
            <div className="h-8 w-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
              CV
            </div>
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
              <span>Free</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
