"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { useLang } from "./LanguageProvider";

export default function DashboardTopBar() {
  const { user, logout } = useAuth();
  const { locale, toggle } = useLang();

  if (!user) return null;

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/logo.jpg"
            alt="CryptoVision"
            className="h-8 w-8 rounded-lg object-cover"
          />
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
              <img src={user.photo} alt="" className="h-7 w-7 rounded-full" />
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
  );
}
